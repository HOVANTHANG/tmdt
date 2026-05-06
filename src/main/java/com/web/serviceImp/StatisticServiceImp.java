package com.web.serviceImp;

import com.web.dto.response.DashboardSellerResponse;
import com.web.dto.response.RevenueMonthResponse;
import com.web.entity.Product;
import com.web.entity.Shop;
import com.web.entity.User;
import com.web.exception.MessageException;
import com.web.repository.InvoiceDetailRepository;
import com.web.repository.ProductRepository;
import com.web.servive.StatisticService;
import com.web.utils.UserUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class StatisticServiceImp implements StatisticService {

    @Autowired
    private UserUtils userUtils;

    @Autowired
    private InvoiceDetailRepository invoiceDetailRepository;

    @Autowired
    private ProductRepository productRepository;

    private Shop getSellerShop() {
        User currentUser = userUtils.getUserWithAuthority();

        if (currentUser.getAuthorities() == null || currentUser.getAuthorities().getName() == null) {
            throw new MessageException("Không xác định được quyền tài khoản");
        }

        if (!"ROLE_SELLER".equals(currentUser.getAuthorities().getName())) {
            throw new MessageException("Chỉ seller mới được xem dashboard này");
        }

        if (currentUser.getShop() == null) {
            throw new MessageException("Tài khoản seller chưa có shop");
        }

        return currentUser.getShop();
    }

    @Override
    public DashboardSellerResponse dashboardSummaryForSeller() {
        Shop shop = getSellerShop();

        DashboardSellerResponse res = new DashboardSellerResponse();

        res.setShopName(shop.getShopName());

        res.setRevenueThisMonth(invoiceDetailRepository.revenueThisMonthByShop(shop.getId()));
        res.setRevenueToday(invoiceDetailRepository.revenueTodayByShop(shop.getId()));

        res.setProfitThisMonth(invoiceDetailRepository.profitThisMonthByShop(shop.getId()));
        res.setProfitToday(invoiceDetailRepository.profitTodayByShop(shop.getId()));

        res.setInvoiceDoneToday(invoiceDetailRepository.invoiceDoneTodayByShop(shop.getId()));
        res.setTotalProduct(productRepository.countByShopIdAndDeletedFalse(shop.getId()));
        res.setTotalInvoice(invoiceDetailRepository.totalInvoiceByShop(shop.getId()));
        res.setTotalInvoiceDone(invoiceDetailRepository.totalInvoiceDoneByShop(shop.getId()));

        return res;
    }

    @Override
    public List<RevenueMonthResponse> revenueChartForSeller(Integer year) {
        Shop shop = getSellerShop();
        List<Object[]> rows = invoiceDetailRepository.revenueByMonthOfYearAndShop(shop.getId(), year);

        List<RevenueMonthResponse> responses = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            double revenue = 0D;

            for (Object[] row : rows) {
                Integer rowMonth = ((Number) row[0]).intValue();
                Double rowRevenue = row[1] == null ? 0D : ((Number) row[1]).doubleValue();

                if (rowMonth == month) {
                    revenue = rowRevenue;
                    break;
                }
            }

            responses.add(new RevenueMonthResponse(month, revenue));
        }

        return responses;
    }

    @Override
    public List<Product> topProductsForSeller() {
        Shop shop = getSellerShop();
        return productRepository.findTopSellingByShop(shop.getId());
    }

    @Override
    public List<RevenueMonthResponse> profitChartForSeller(Integer year) {
        Shop shop = getSellerShop();

        List<Object[]> rows = invoiceDetailRepository.profitByMonthOfYearAndShop(shop.getId(), year);

        List<RevenueMonthResponse> responses = new ArrayList<>();

        for (int month = 1; month <= 12; month++) {
            double profit = 0D;

            for (Object[] row : rows) {
                Integer rowMonth = ((Number) row[0]).intValue();
                Double rowProfit = row[1] == null ? 0D : ((Number) row[1]).doubleValue();

                if (rowMonth == month) {
                    profit = rowProfit;
                    break;
                }
            }

            responses.add(new RevenueMonthResponse(month, profit));
        }

        return responses;
    }
}