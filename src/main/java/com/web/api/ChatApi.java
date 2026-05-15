package com.web.api;

import com.web.dto.response.ChatDto;
import com.web.entity.Chatting;
import com.web.entity.User;
import com.web.repository.ChatRepository;
import com.web.servive.ChatService;
import com.web.utils.UserUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;
import java.sql.Timestamp;
import java.util.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin
public class ChatApi {

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private UserUtils userUtils;

    @Autowired
    private ChatService chatService;

    /* ── Gemini AI Chat ── */
    @PostMapping
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request, HttpSession session) {
        String userMessage = request.get("message");
        try {
            String reply = chatService.chatWithGemini(userMessage, session);
            return ResponseEntity.ok(Map.of("reply", reply));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("reply", "Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau."));
        }
    }

    /* ── Current user info (cho cả user và seller để lấy username kết nối STOMP) ── */
    @GetMapping("/user/current-info")
    public ResponseEntity<?> currentUserInfo() {
        User u = userUtils.getUserWithAuthority();
        return ResponseEntity.ok(Map.of(
                "id", u.getId(),
                "username", u.getUsername(),
                "fullname", u.getFullname() != null ? u.getFullname() : u.getUsername()
        ));
    }

    @GetMapping("/seller/current-info")
    public ResponseEntity<?> currentSellerInfo() {
        User u = userUtils.getUserWithAuthority();
        return ResponseEntity.ok(Map.of(
                "id", u.getId(),
                "username", u.getUsername(),
                "fullname", u.getFullname() != null ? u.getFullname() : u.getUsername()
        ));
    }

    /* ── Admin legacy ── */
    @GetMapping("/user/my-chat")
    public ResponseEntity<?> myChat() {
        List<Chatting> result = chatRepository.myChat(userUtils.getUserWithAuthority().getId());
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/admin/getAllUserChat")
    public ResponseEntity<?> getAllUserChat(@RequestParam(value = "search", required = false) String search) {
        if (search == null)
            search = "";
        search = "%" + search + "%";
        Set<User> list = chatRepository.getAllUserChat(search);
        Set<ChatDto> dtoList = new HashSet<>();
        for (User u : list) {
            Chatting c = chatRepository.findLastChatting(u.getId());
            dtoList.add(c != null
                    ? new ChatDto(u, c.getContent(), calculateTime(c.getCreatedDate()), c.getCreatedDate(), " ")
                    : new ChatDto(u, "", "0 min", new Timestamp(System.currentTimeMillis()), " "));
        }
        return new ResponseEntity<>(dtoList, HttpStatus.OK);
    }

    @GetMapping("/admin/getListChat")
    public List<Chatting> getListChat(@RequestParam("idreciver") Long idreciver) {
        return chatRepository.findByUser(idreciver);
    }

    private String calculateTime(Timestamp t) {
        long end = System.currentTimeMillis() - t.getTime();
        if (end / 60000 < 1)
            return "1 min";
        if (end / 60000 < 60)
            return (end / 60000) + " min";
        if (end / 3600000 < 24)
            return (end / 3600000) + " hour";
        return (end / 86400000) + " day";
    }
}
