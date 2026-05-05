package com.web.controller;

import com.web.dto.request.ChatMessageRequest;
import com.web.servive.ChatService1;
import com.web.utils.UserUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService1 ChatService1;
    private final UserUtils userUtils;

    public ChatController(ChatService1 ChatService1, UserUtils userUtils) {
        this.ChatService1 = ChatService1;
        this.userUtils = userUtils;
    }

    @PostMapping("/user/send")
    public ResponseEntity<?> userSendMessage(@RequestBody ChatMessageRequest request) {
        Long userId = userUtils.getUserWithAuthority().getId();
        return new ResponseEntity<>(ChatService1.userSendMessage(userId, request), HttpStatus.CREATED);
    }

    @GetMapping("/user/messages")
    public ResponseEntity<?> getUserMessages(@RequestParam Long shopId) {
        Long userId = userUtils.getUserWithAuthority().getId();
        return new ResponseEntity<>(ChatService1.getMessagesForUser(userId, shopId), HttpStatus.OK);
    }

    @GetMapping("/user/rooms")
    public ResponseEntity<?> getUserRooms() {
        Long userId = userUtils.getUserWithAuthority().getId();
        return new ResponseEntity<>(ChatService1.getUserRooms(userId), HttpStatus.OK);
    }

    @PostMapping("/seller/send")
    public ResponseEntity<?> sellerSendMessage(@RequestBody ChatMessageRequest request) {
        Long sellerId = userUtils.getUserWithAuthority().getId();
        return new ResponseEntity<>(ChatService1.sellerSendMessage(sellerId, request), HttpStatus.CREATED);
    }

    @GetMapping("/seller/messages")
    public ResponseEntity<?> getSellerMessages(@RequestParam Long roomId) {
        Long sellerId = userUtils.getUserWithAuthority().getId();
        return new ResponseEntity<>(ChatService1.getMessagesForSeller(sellerId, roomId), HttpStatus.OK);
    }

    @GetMapping("/seller/rooms")
    public ResponseEntity<?> getSellerRooms() {
        Long sellerId = userUtils.getUserWithAuthority().getId();
        return new ResponseEntity<>(ChatService1.getSellerRooms(sellerId), HttpStatus.OK);
    }
}