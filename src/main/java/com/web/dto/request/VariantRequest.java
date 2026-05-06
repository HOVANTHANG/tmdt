package com.web.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VariantRequest {

    private Long id;

    private String tier1name; // Ví dụ: Màu
    private String tier1value; // Ví dụ: Đen

    private String tier2name; // Ví dụ: Size
    private String tier2value; // Ví dụ: L

    private Double price;
    private Double importPrice;
    private Integer quantity;
    private String image;
}