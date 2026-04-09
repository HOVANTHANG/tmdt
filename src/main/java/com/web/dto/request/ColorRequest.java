package com.web.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ColorRequest {

    private String name;

    private String image;

    private Double price;

    private Integer quantity;
}
