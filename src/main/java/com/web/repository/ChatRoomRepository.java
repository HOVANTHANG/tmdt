package com.web.repository;

import com.web.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    Optional<ChatRoom> findByUserIdAndShopId(Long userId, Long shopId);

    List<ChatRoom> findByUserIdOrderByIdDesc(Long userId);

    List<ChatRoom> findByShopIdOrderByIdDesc(Long shopId);
}