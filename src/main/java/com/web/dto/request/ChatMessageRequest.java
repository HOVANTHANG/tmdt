package com.web.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessageRequest {

    private Long shopId;        // Shop entity ID (user gửi lên)

    private Long roomId;        // Room ID (seller gửi lên)

    private String content;

    private Long sellerUserId;  // Seller's user account ID (để push WS notification)

    private Long userId;        // User's account ID (để push WS notification)
}