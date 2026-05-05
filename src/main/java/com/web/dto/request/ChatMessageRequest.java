package com.web.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessageRequest {

    private Long shopId;

    private Long roomId;

    private String content;
}