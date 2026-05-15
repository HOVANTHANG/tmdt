package com.web.servive;

import com.web.dto.request.ChatMessageRequest;
import com.web.dto.response.ChatMessageResponse;
import com.web.dto.response.ChatRoomResponse;
import com.web.entity.ChatMessage;
import com.web.entity.ChatRoom;
import com.web.entity.Shop;
import com.web.entity.User;
import com.web.repository.ChatMessageRepository;
import com.web.repository.ChatRoomRepository;
import com.web.repository.ShopRepository;
import com.web.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService1 {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final ShopRepository shopRepository;

    public ChatService1(ChatRoomRepository chatRoomRepository,
            ChatMessageRepository chatMessageRepository,
            UserRepository userRepository,
            ShopRepository shopRepository) {
        this.chatRoomRepository = chatRoomRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
        this.shopRepository = shopRepository;
    }

    @Transactional
    public ChatMessageResponse userSendMessage(Long userId, ChatMessageRequest request) {
        if (request.getShopId() == null) {
            throw new RuntimeException("shopId không được để trống");
        }

        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new RuntimeException("Nội dung không được để trống");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        Shop shop = shopRepository.findById(request.getShopId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy shop"));

        ChatRoom room = chatRoomRepository.findByUserIdAndShopId(userId, request.getShopId())
                .orElseGet(() -> {
                    ChatRoom newRoom = new ChatRoom();
                    newRoom.setUser(user);
                    newRoom.setShop(shop);
                    newRoom.setCreatedDate(Date.valueOf(LocalDate.now()));
                    newRoom.setCreatedTime(Time.valueOf(LocalTime.now()));
                    return chatRoomRepository.save(newRoom);
                });

        ChatMessage message = new ChatMessage();
        message.setRoom(room);
        message.setSenderId(userId);
        message.setContent(request.getContent().trim());
        message.setCreatedDate(Date.valueOf(LocalDate.now()));
        message.setCreatedTime(Time.valueOf(LocalTime.now()));

        ChatMessage saved = chatMessageRepository.save(message);

        return mapMessage(saved, userId);
    }

    @Transactional
    public ChatMessageResponse sellerSendMessage(Long sellerId, ChatMessageRequest request) {
        if (request.getRoomId() == null) {
            throw new RuntimeException("roomId không được để trống");
        }

        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new RuntimeException("Nội dung không được để trống");
        }

        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy seller"));

        if (seller.getShop() == null) {
            throw new RuntimeException("Seller chưa có shop");
        }

        ChatRoom room = chatRoomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng chat"));

        if (!room.getShop().getId().equals(seller.getShop().getId())) {
            throw new RuntimeException("Bạn không có quyền trả lời phòng chat này");
        }

        ChatMessage message = new ChatMessage();
        message.setRoom(room);
        message.setSenderId(sellerId);
        message.setContent(request.getContent().trim());
        message.setCreatedDate(Date.valueOf(LocalDate.now()));
        message.setCreatedTime(Time.valueOf(LocalTime.now()));

        ChatMessage saved = chatMessageRepository.save(message);

        return mapMessage(saved, sellerId);
    }

    public List<ChatMessageResponse> getMessagesForUser(Long userId, Long shopId) {
        ChatRoom room = chatRoomRepository.findByUserIdAndShopId(userId, shopId)
                .orElse(null);

        if (room == null) {
            return List.of();
        }

        return chatMessageRepository.findByRoomIdOrderByIdAsc(room.getId())
                .stream()
                .map(m -> mapMessage(m, userId))
                .collect(Collectors.toList());
    }

    public List<ChatMessageResponse> getMessagesForSeller(Long sellerId, Long roomId) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy seller"));

        if (seller.getShop() == null) {
            throw new RuntimeException("Seller chưa có shop");
        }

        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng chat"));

        if (!room.getShop().getId().equals(seller.getShop().getId())) {
            throw new RuntimeException("Bạn không có quyền xem phòng chat này");
        }

        return chatMessageRepository.findByRoomIdOrderByIdAsc(roomId)
                .stream()
                .map(m -> mapMessage(m, sellerId))
                .collect(Collectors.toList());
    }

    public List<ChatRoomResponse> getUserRooms(Long userId) {
        return chatRoomRepository.findByUserIdOrderByIdDesc(userId)
                .stream()
                .map(this::mapRoom)
                .collect(Collectors.toList());
    }

    public List<ChatRoomResponse> getSellerRooms(Long sellerId) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy seller"));

        if (seller.getShop() == null) {
            throw new RuntimeException("Seller chưa có shop");
        }

        return chatRoomRepository.findByShopIdOrderByIdDesc(seller.getShop().getId())
                .stream()
                .map(this::mapRoom)
                .collect(Collectors.toList());
    }

    private ChatMessageResponse mapMessage(ChatMessage message, Long currentUserId) {
        ChatMessageResponse res = new ChatMessageResponse();
        res.setId(message.getId());
        res.setRoomId(message.getRoom().getId());
        res.setSenderId(message.getSenderId());
        res.setContent(message.getContent());
        res.setCreatedDate(String.valueOf(message.getCreatedDate()));
        res.setCreatedTime(String.valueOf(message.getCreatedTime()));
        res.setMine(message.getSenderId().equals(currentUserId));
        return res;
    }

    private ChatRoomResponse mapRoom(ChatRoom room) {
        ChatRoomResponse res = new ChatRoomResponse();

        res.setRoomId(room.getId());

        if (room.getUser() != null) {
            res.setUserId(room.getUser().getId());
            res.setUsername(room.getUser().getFullname() != null
                    ? room.getUser().getFullname()
                    : room.getUser().getUsername());
        }

        if (room.getShop() != null) {
            res.setShopId(room.getShop().getId());
            res.setShopName(room.getShop().getShopName());
            res.setShopAvatar(room.getShop().getAvatar());

            // sellerUserId: cách 1 - shop.owner
            if (room.getShop().getOwner() != null) {
                res.setSellerUserId(room.getShop().getOwner().getId());
            } else {
                // cách 2 - tìm user có shop_id = shop.id (users.shop_id)
                userRepository.findByShopId(room.getShop().getId())
                        .ifPresent(seller -> res.setSellerUserId(seller.getId()));
            }
        }

        return res;
    }
}
