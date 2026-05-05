package com.web.dto.response;

import lombok.Data;

@Data
public class ProductShopResponse {

    private Long id;

    private String code;

    private String name;

    private String imageBanner;

    private Double price;

    private Double oldPrice;

    private ShopResponse shop;
}