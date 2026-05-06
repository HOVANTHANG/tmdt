package com.web.servive;

import com.web.dto.response.DashboardSellerResponse;
import com.web.dto.response.RevenueMonthResponse;
import com.web.entity.Product;

import java.util.List;

public interface StatisticService {

    DashboardSellerResponse dashboardSummaryForSeller();

    List<RevenueMonthResponse> revenueChartForSeller(Integer year);

    List<Product> topProductsForSeller();

    List<RevenueMonthResponse> profitChartForSeller(Integer year);
}