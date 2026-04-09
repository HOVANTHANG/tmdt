package com.web.dto.response;
import com.web.entity.ProductImage;
import lombok.Getter;
import lombok.Setter;

import java.sql.Date;
import java.sql.Time;
import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
public class ProductResponse {

    private Long id;

    private String code;

    private String name;

    private Double price;

    private Double oldPrice;

    private String imageBanner;

    private String description;

    private Date createdDate;

    private Time createdTime;

    private Integer quantitySold;

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

    private List<ProductImage> productImages = new ArrayList<>();
}
