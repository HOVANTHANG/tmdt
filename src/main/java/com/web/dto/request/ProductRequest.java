package com.web.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class ProductRequest {

    private Long id;
    private String code;
    private String name;
    private Double price;
    private Double oldPrice;
    private String imageBanner;
    private String description;

    private Long tradeMarkId;
    private Long categoryId;
    private Long shopId;

    private List<String> linkLinkImages = new ArrayList<>();
    private List<VariantRequest> variants = new ArrayList<>();
}