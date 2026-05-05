package com.web.dto.response;

import lombok.Data;

@Data
public class ShopResponse {

    private Long id;

    private String shopName;

    private String avatar;

    private Long totalProduct;
}