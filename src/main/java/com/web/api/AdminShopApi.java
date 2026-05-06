package com.web.api;

import com.web.dto.response.ShopStatisticResponse;
import com.web.entity.Shop;
import com.web.enums.ShopStatus;
import com.web.repository.InvoiceDetailRepository;
import com.web.repository.ProductRepository;
import com.web.repository.ShopRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/shop")
@CrossOrigin
public class AdminShopApi {

    private final ShopRepository shopRepository;
    private final ProductRepository productRepository;
    private final InvoiceDetailRepository invoiceDetailRepository;

    public AdminShopApi(
            ShopRepository shopRepository,
            ProductRepository productRepository,
            InvoiceDetailRepository invoiceDetailRepository) {
        this.shopRepository = shopRepository;
        this.productRepository = productRepository;
        this.invoiceDetailRepository = invoiceDetailRepository;
    }

    @GetMapping("/all")
    public ResponseEntity<?> findAllShop() {
        return ResponseEntity.ok(shopRepository.findAllByStatus(ShopStatus.APPROVED));
    }

    @GetMapping("/statistic")
    public ResponseEntity<?> statisticShop() {
        List<ShopStatisticResponse> result = shopRepository.findAllByStatus(ShopStatus.APPROVED)
                .stream()
                .map(shop -> {
                    ShopStatisticResponse dto = new ShopStatisticResponse();

                    dto.setShopId(shop.getId());
                    dto.setShopName(shop.getShopName());
                    dto.setAvatar(shop.getAvatar());
                    dto.setStatus(shop.getStatus() != null ? shop.getStatus().name() : "");

                    dto.setTotalProduct(productRepository.countByShopId(shop.getId()));
                    dto.setTotalOrder(invoiceDetailRepository.countOrderByShop(shop.getId()));
                    dto.setRevenue(invoiceDetailRepository.revenueByShop(shop.getId()));
                    dto.setProfit(invoiceDetailRepository.profitByShop(shop.getId()));

                    return dto;
                })
                .toList();

        return ResponseEntity.ok(result);
    }
}