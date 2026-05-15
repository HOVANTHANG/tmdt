package com.web.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatRoomResponse {

    private Long roomId;

    private Long userId;        // user's account ID
    private String username;    // user's display name

    private Long shopId;        // Shop entity ID
    private String shopName;
    private String shopAvatar;

    private Long sellerUserId;  // seller's account ID (for STOMP routing)
}