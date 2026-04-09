package com.web.dto.response;

import com.web.entity.Product;
import com.web.entity.ProductCommentImage;
import lombok.Getter;
import lombok.Setter;

import java.sql.Date;
import java.sql.Time;
import java.util.List;

@Getter
@Setter
public class ProductCommentResponse {

    private Long id;

    private Float star;

    private String content;

    private Date createdDate;

    private Time createdTime;

    private List<ProductCommentImage> productCommentImages;

    private UserDto user;

    private Boolean isMyComment;
}
