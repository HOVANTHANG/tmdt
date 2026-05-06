package com.web.dto.response;

import lombok.Data;

@Data
public class ShopApprovalResponse {
    private Long id;
    private String shopName;
    private String shopSlug;
    private String phone;
    private String email;
    private String description;
    private String avatar;
    private String status;

    private Long ownerId;
    private String ownerUsername;
    private String ownerFullname;
    private String ownerEmail;
}