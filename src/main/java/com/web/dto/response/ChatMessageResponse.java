package com.web.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessageResponse {

    private Long id;

    private Long roomId;

    private Long senderId;

    private String content;

    private String createdDate;

    private String createdTime;

    private Boolean mine;
}