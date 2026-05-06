package com.web.dto.response;

import com.web.entity.Invoice;
import com.web.entity.Product;

import com.web.entity.ProductVariant;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InvoiceDetailResponse {

    private Long id;

    private Integer quantity;

    private Double price;

    private ProductVariant productVariant;

    private Product product;

    private Invoice invoice;

    private Double importPrice;

    private Long shopId;
    private String shopName;
    private String shopAvatar;
}
