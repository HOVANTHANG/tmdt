package com.web.dto.response;

import com.web.entity.User;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import java.sql.Date;

@Getter
@Setter
public class BlogResponse {

    private Long id;

    private Date createdDate;

    private String title;

    private String description;

    private String content;

    private Boolean primaryBlog;

    private String imageBanner;

    private UserDto user;
}
