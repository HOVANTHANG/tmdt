package com.web.repository;

import com.web.entity.Chatting;
import com.web.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Set;

public interface ChatRepository extends JpaRepository<Chatting,Long> {

    @Query(value = "select c from Chatting c where (c.sender.id = ?1 or c.receiver.id = ?1 )")
    public List<Chatting> findByUser(Long idUser);

    @Query("select c.sender from Chatting c where c.receiver is null and (c.sender.username like ?1 or c.sender.email like ?1) ")
    public Set<User> getAllUserChat(String param);

    @Query("select c from Chatting c where c.sender.id = ?1 or c.receiver.id = ?1")
    List<Chatting> myChat(Long id);

    @Query(value = "select c.* from chatting c where (c.sender = ?1 or c.receiver = ?1 ) order by id desc limit 1 offset  0", nativeQuery = true)
    public Chatting findLastChatting(Long idUser);

    // ── Seller ↔ User chat ──

    @Query("SELECT c FROM Chatting c WHERE (c.sender.id = ?1 AND c.receiver.id = ?2) OR (c.sender.id = ?2 AND c.receiver.id = ?1) ORDER BY c.createdDate ASC")
    List<Chatting> getMessagesBetween(Long id1, Long id2);

    @Query("SELECT DISTINCT c.receiver FROM Chatting c WHERE c.sender.id = ?1 AND c.receiver IS NOT NULL")
    Set<User> getReceiversOf(Long senderId);

    @Query("SELECT DISTINCT c.sender FROM Chatting c WHERE c.receiver.id = ?1")
    Set<User> getSendersTo(Long receiverId);

    @Query(value = "SELECT * FROM chatting WHERE (sender = ?1 AND receiver = ?2) OR (sender = ?2 AND receiver = ?1) ORDER BY id DESC LIMIT 1", nativeQuery = true)
    Chatting findLastChattingBetween(Long id1, Long id2);
}

