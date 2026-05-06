package com.web.dto.response;

import lombok.Data;

@Data
public class ShopStatisticResponse {

    private Long shopId;

    private String shopName;

    private String avatar;

    private String status;

    private Long totalProduct;

    private Long totalOrder;

    private Double revenue;

    private Double profit;
}