package com.web.dto.response;

import com.web.entity.Invoice;
import com.web.entity.Product;
import com.web.entity.ProductColor;
import com.web.entity.ProductStorage;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

@Getter
@Setter
public class InvoiceDetailResponse {

    private Long id;

    private Integer quantity;

    private Double price;

    private ProductStorage productStorage;

    private ProductColor productColor;

    private Product product;

    private Invoice invoice;

    private String imei;
}
