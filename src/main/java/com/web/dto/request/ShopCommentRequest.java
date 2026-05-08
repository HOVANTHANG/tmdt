package com.web.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShopCommentRequest {
    private Long invoiceId;
    private Long shopId;
    private Float star;
    private String content;
}