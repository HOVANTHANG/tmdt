package com.web.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.sql.Date;
import java.sql.Time;
import java.util.List;

@Getter
@Setter
public class ReviewResponse {

    private Long id;

    private Float star;

    private String content;

    private Date createdDate;

    private Time createdTime;

    private Long userId;

    private String username;

    private String fullname;

    private List<String> images;
}