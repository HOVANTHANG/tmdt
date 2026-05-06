package com.web.dto.response;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DashboardSellerResponse {

    private String shopName;
    private Double revenueThisMonth;
    private Double revenueToday;
    private Long invoiceDoneToday;
    private Long totalProduct;
    private Long totalInvoice;
    private Long totalInvoiceDone;

    private Double profitThisMonth;
    private Double profitToday;

}