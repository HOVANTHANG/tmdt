package com.web.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SellerRegisterRequest {

    private String shopName;
    private String shopSlug;
    private String phone;
    private String email;
    private String description;
    private String avatar;
}