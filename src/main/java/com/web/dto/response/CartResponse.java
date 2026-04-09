package com.web.dto.response;

import com.web.entity.Product;
import com.web.entity.ProductColor;
import com.web.entity.ProductStorage;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartResponse {

    private Long id;

    private Integer quantity;

    private ProductColor productColor;

    private ProductStorage productStorage;

    private Product product;
}
