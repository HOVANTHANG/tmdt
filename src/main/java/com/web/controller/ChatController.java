package com.web.controller;

import com.web.dto.request.ChatMessageRequest;
import com.web.dto.response.ChatMessageResponse;
import com.web.dto.response.ChatRoomResponse;
import com.web.entity.Shop;
import com.web.entity.User;
import com.web.repository.ShopRepository;
import com.web.repository.UserRepository;
import com.web.servive.ChatService1;
import com.web.utils.UserUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService1 chatService1;
    private final UserUtils userUtils;
    private final SimpMessagingTemplate messagingTemplate;
    private final ShopRepository shopRepository;
    private final UserRepository userRepository;

    public ChatController(ChatService1 chatService1, UserUtils userUtils,
                          SimpMessagingTemplate messagingTemplate,
                          ShopRepository shopRepository,
                          UserRepository userRepository) {
        this.chatService1       = chatService1;
        this.userUtils          = userUtils;
        this.messagingTemplate  = messagingTemplate;
        this.shopRepository     = shopRepository;
        this.userRepository     = userRepository;
    }

    /* ── User gửi tin cho shop ── */
    @PostMapping("/user/send")
    public ResponseEntity<?> userSendMessage(@RequestBody ChatMessageRequest request) {
        Long userId = userUtils.getUserWithAuthority().getId();
        ChatMessageResponse saved = chatService1.userSendMessage(userId, request);

        Long sellerUserId = resolveSellerUserId(request);
        System.out.println("[ChatController] user/send -> sellerUserId=" + sellerUserId
                + " shopId=" + request.getShopId()
                + " roomId=" + saved.getRoomId());
        if (sellerUserId != null) {
            push(sellerUserId, saved);
        } else {
            System.err.println("[ChatController] WARNING: Cannot resolve sellerUserId for shopId=" + request.getShopId());
        }

        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    /* ── Seller gửi tin cho user ── */
    @PostMapping("/seller/send")
    public ResponseEntity<?> sellerSendMessage(@RequestBody ChatMessageRequest request) {
        Long sellerId = userUtils.getUserWithAuthority().getId();
        ChatMessageResponse saved = chatService1.sellerSendMessage(sellerId, request);

        System.out.println("[ChatController] seller/send -> userId=" + request.getUserId()
                + " roomId=" + saved.getRoomId());
        if (request.getUserId() != null) {
            push(request.getUserId(), saved);
        } else {
            System.err.println("[ChatController] WARNING: userId is null in request");
        }

        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    /* ── User xem lịch sử chat với shop ── */
    @GetMapping("/user/messages")
    public ResponseEntity<?> getUserMessages(@RequestParam Long shopId) {
        Long userId = userUtils.getUserWithAuthority().getId();
        return new ResponseEntity<>(chatService1.getMessagesForUser(userId, shopId), HttpStatus.OK);
    }

    /* ── User xem danh sách shop đã chat ── */
    @GetMapping("/user/rooms")
    public ResponseEntity<?> getUserRooms() {
        Long userId = userUtils.getUserWithAuthority().getId();
        List<ChatRoomResponse> rooms = chatService1.getUserRooms(userId);
        return new ResponseEntity<>(rooms, HttpStatus.OK);
    }

    /* ── Seller xem lịch sử chat với 1 user (theo roomId) ── */
    @GetMapping("/seller/messages")
    public ResponseEntity<?> getSellerMessages(@RequestParam Long roomId) {
        Long sellerId = userUtils.getUserWithAuthority().getId();
        return new ResponseEntity<>(chatService1.getMessagesForSeller(sellerId, roomId), HttpStatus.OK);
    }

    /* ── Seller xem danh sách user đã chat ── */
    @GetMapping("/seller/rooms")
    public ResponseEntity<?> getSellerRooms() {
        Long sellerId = userUtils.getUserWithAuthority().getId();
        List<ChatRoomResponse> rooms = chatService1.getSellerRooms(sellerId);
        return new ResponseEntity<>(rooms, HttpStatus.OK);
    }

    /**
     * Tìm seller userId từ nhiều nguồn:
     * 1. Từ request body (nếu frontend truyền lên)
     * 2. Từ shop.getOwner().getId()
     * 3. Từ User.shop relationship (users.shop_id column)
     */
    private Long resolveSellerUserId(ChatMessageRequest request) {
        // Ưu tiên giá trị frontend truyền lên
        if (request.getSellerUserId() != null) {
            return request.getSellerUserId();
        }

        if (request.getShopId() == null) return null;

        Optional<Shop> shopOpt = shopRepository.findById(request.getShopId());
        if (shopOpt.isEmpty()) return null;

        Shop shop = shopOpt.get();

        // Cách 1: shop.owner (cột owner_user_id)
        if (shop.getOwner() != null) {
            return shop.getOwner().getId();
        }

        // Cách 2: tìm user có shop_id = shop.id (cột shop_id trên bảng users)
        Optional<User> sellerOpt = userRepository.findByShopId(shop.getId());
        if (sellerOpt.isPresent()) {
            return sellerOpt.get().getId();
        }

        return null;
    }

    /* ── Push WebSocket notification đến /topic/chat/{userId} ── */
    private void push(Long recipientUserId, ChatMessageResponse msg) {
        try {
            messagingTemplate.convertAndSend("/topic/chat/" + recipientUserId, msg);
            System.out.println("[WS Push] -> /topic/chat/" + recipientUserId
                    + " | roomId=" + msg.getRoomId()
                    + " | content=" + msg.getContent());
        } catch (Exception e) {
            System.err.println("[WS Push ERROR] " + e.getMessage());
        }
    }
}