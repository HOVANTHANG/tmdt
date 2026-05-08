package com.web.dto.request;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductCommentRequest {
    private Long invoiceDetailId;
    private Float star;
    private String content;
    private List<String> images;
}