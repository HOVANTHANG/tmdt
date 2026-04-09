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

    private String screen;

    private String frontCamera;

    private String backCamera;

    private String operaSystem;

    private String cpu;

    private String material;

    private String accessory;

    private String specialFeature;

    private String sim;

    private String securityInfor;

    private String mobileNetwork;

    private Long tradeMarkId;

    private Long categoryId;

    private String imei1;

    private String imei2;

    private List<String> linkLinkImages = new ArrayList<>();

    private List<StorageRequest> storage = new ArrayList<>();
}
