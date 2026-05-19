package com.web.api;

import com.web.entity.Shop;
import com.web.enums.ShopStatus;
import com.web.repository.InvoiceDetailRepository;
import com.web.repository.ShopRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * API quản lý chiết khấu (commission) cho admin.
 *
 * Công thức: Chiết khấu = Doanh thu × commissionRate%
 * Tính toán trong Java để tránh lỗi JPQL khi truy cập shop.commissionRate.
 */
@RestController
@RequestMapping("/api/admin/commission")
@CrossOrigin
public class CommissionApi {

    private final ShopRepository shopRepository;
    private final InvoiceDetailRepository invoiceDetailRepository;

    public CommissionApi(ShopRepository shopRepository,
                         InvoiceDetailRepository invoiceDetailRepository) {
        this.shopRepository = shopRepository;
        this.invoiceDetailRepository = invoiceDetailRepository;
    }

    /** Lấy commissionRate của shop, mặc định 5% nếu null */
    private double rate(Shop shop) {
        return shop.getCommissionRate() != null ? shop.getCommissionRate() : 5.0;
    }

    // ── Tổng quan chiết khấu toàn hệ thống ──────────────────────────
    @GetMapping("/summary")
    public ResponseEntity<?> commissionSummary() {
        List<Shop> shops = shopRepository.findAllByStatus(ShopStatus.APPROVED);

        double thisMonth = 0.0;
        double allTime   = 0.0;

        for (Shop shop : shops) {
            double r = rate(shop) / 100.0;

            Double revThisMonth = invoiceDetailRepository.revenueThisMonthByShop(shop.getId());
            Double revAllTime   = invoiceDetailRepository.revenueByShop(shop.getId());

            thisMonth += (revThisMonth != null ? revThisMonth : 0.0) * r;
            allTime   += (revAllTime   != null ? revAllTime   : 0.0) * r;
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("commissionThisMonth", thisMonth);
        result.put("commissionAllTime",   allTime);

        return ResponseEntity.ok(result);
    }

    // ── Chiết khấu theo tháng trong năm (biểu đồ admin) ─────────────
    @GetMapping("/chart")
    public ResponseEntity<?> commissionChart(@RequestParam Integer year) {
        List<Shop> shops = shopRepository.findAllByStatus(ShopStatus.APPROVED);

        // monthly[0..11] = tổng chiết khấu mỗi tháng từ tất cả shops
        double[] monthly = new double[12];

        for (Shop shop : shops) {
            double r = rate(shop) / 100.0;
            List<Object[]> rows = invoiceDetailRepository.revenueByMonthOfYearAndShop(shop.getId(), year);
            for (Object[] row : rows) {
                int m    = ((Number) row[0]).intValue() - 1;
                double v = row[1] == null ? 0.0 : ((Number) row[1]).doubleValue();
                monthly[m] += v * r;
            }
        }

        List<Double> data = new ArrayList<>();
        for (double v : monthly) data.add(v);

        return ResponseEntity.ok(Map.of("year", year, "data", data));
    }

    // ── Chi tiết chiết khấu từng shop ───────────────────────────────
    @GetMapping("/by-shop")
    public ResponseEntity<?> commissionByShop() {
        List<Shop> shops = shopRepository.findAllByStatus(ShopStatus.APPROVED);

        List<Map<String, Object>> result = new ArrayList<>();
        for (Shop shop : shops) {
            double r = rate(shop) / 100.0;

            Double revTotal     = invoiceDetailRepository.revenueByShop(shop.getId());
            Double revThisMonth = invoiceDetailRepository.revenueThisMonthByShop(shop.getId());
            Long   orders       = invoiceDetailRepository.countOrderByShop(shop.getId());

            double commTotal     = (revTotal     != null ? revTotal     : 0.0) * r;
            double commThisMonth = (revThisMonth != null ? revThisMonth : 0.0) * r;

            Map<String, Object> dto = new LinkedHashMap<>();
            dto.put("shopId",            shop.getId());
            dto.put("shopName",          shop.getShopName());
            dto.put("avatar",            shop.getAvatar());
            dto.put("commissionRate",    rate(shop));
            dto.put("totalRevenue",      revTotal     != null ? revTotal     : 0.0);
            dto.put("commissionTotal",   commTotal);
            dto.put("commissionThisMonth", commThisMonth);
            dto.put("totalOrders",       orders != null ? orders : 0L);
            result.add(dto);
        }

        return ResponseEntity.ok(result);
    }

    // ── Chiết khấu theo tháng của 1 shop cụ thể ─────────────────────
    @GetMapping("/by-shop/{shopId}/chart")
    public ResponseEntity<?> commissionChartByShop(
            @PathVariable Long shopId,
            @RequestParam Integer year) {

        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy shop"));

        double r = rate(shop) / 100.0;
        List<Object[]> rows = invoiceDetailRepository.revenueByMonthOfYearAndShop(shopId, year);

        List<Double> monthly = new ArrayList<>(Collections.nCopies(12, 0.0));
        for (Object[] row : rows) {
            int m    = ((Number) row[0]).intValue() - 1;
            double v = row[1] == null ? 0.0 : ((Number) row[1]).doubleValue();
            monthly.set(m, v * r);
        }

        return ResponseEntity.ok(Map.of("shopId", shopId, "year", year, "data", monthly));
    }

    // ── Cập nhật tỉ lệ chiết khấu của 1 shop ────────────────────────
    @PostMapping("/by-shop/{shopId}/rate")
    public ResponseEntity<?> updateCommissionRate(
            @PathVariable Long shopId,
            @RequestBody Map<String, Object> body) {

        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy shop"));

        Object rateObj = body.get("rate");
        if (rateObj == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Thiếu tham số rate"));
        }

        double rate = ((Number) rateObj).doubleValue();
        if (rate < 0 || rate > 100) {
            return ResponseEntity.badRequest().body(Map.of("message", "Tỉ lệ chiết khấu phải từ 0% đến 100%"));
        }

        shop.setCommissionRate(rate);
        shopRepository.save(shop);

        return ResponseEntity.ok(Map.of(
                "message",        "Cập nhật tỉ lệ chiết khấu thành công",
                "shopId",         shopId,
                "commissionRate", rate
        ));
    }

    // ── Áp dụng tỉ lệ toàn cục cho tất cả shop ──────────────────────
    @PostMapping("/global-rate")
    public ResponseEntity<?> updateGlobalRate(@RequestBody Map<String, Object> body) {
        Object rateObj = body.get("rate");
        if (rateObj == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Thiếu tham số rate"));
        }

        double rate = ((Number) rateObj).doubleValue();
        if (rate < 0 || rate > 100) {
            return ResponseEntity.badRequest().body(Map.of("message", "Tỉ lệ chiết khấu phải từ 0% đến 100%"));
        }

        List<Shop> shops = shopRepository.findAllByStatus(ShopStatus.APPROVED);
        shops.forEach(s -> s.setCommissionRate(rate));
        shopRepository.saveAll(shops);

        return ResponseEntity.ok(Map.of(
                "message",      "Áp dụng tỉ lệ chiết khấu " + rate + "% cho " + shops.size() + " shop",
                "updatedShops", shops.size()
        ));
    }
}
