package com.web.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatRoomResponse {

    private Long roomId;

    private Long userId;

    private String username;

    private Long shopId;

    private String shopName;

    private String shopAvatar;
}