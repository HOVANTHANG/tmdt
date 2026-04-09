package com.web.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.sql.Date;

@Getter
@Setter
public class BlogRequest {

    private Long id;

    private String title;

    private String description;

    private String content;

    private Boolean primaryBlog;

    private String imageBanner;
}
