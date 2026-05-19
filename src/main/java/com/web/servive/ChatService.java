package com.web.servive;

import com.google.gson.*;
import com.web.entity.Product;
import com.web.repository.ProductRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpSession;
import java.net.URI;
import java.net.http.*;
import java.util.*;
import java.util.regex.*;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Value("${groq.api.key}")
    private String groqApiKey;

    @Autowired
    private ProductRepository productRepository;

    // Groq API – tương thích OpenAI format
    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

    // Model miễn phí, nhanh, hỗ trợ tiếng Việt tốt
    private static final String GROQ_MODEL = "llama-3.1-8b-instant";

    // Pattern nhận URL ảnh từ frontend: [URL_IMAGE: https://...]
    private static final Pattern IMAGE_URL_PATTERN = Pattern.compile("\\[URL_IMAGE:\\s*(https?://\\S+)\\]");

    // Giới hạn số lượt lịch sử giữ lại
    private static final int MAX_HISTORY = 5;

    // Giới hạn số sản phẩm gửi vào prompt
    private static final int MAX_PRODUCTS = 40;

    public String chatWithGemini(String userMessage, HttpSession session) {
        // --- Quản lý lịch sử hội thoại ---
        @SuppressWarnings("unchecked")
        List<String[]> history = (List<String[]>) session.getAttribute("groq-history");
        if (history == null)
            history = new ArrayList<>();

        try {
            // --- 1. Chuẩn bị dữ liệu sản phẩm (tối ưu token) ---
            List<Product> products = productRepository.findAllApprovedForAI();
            String productData = products.stream()
                    .sorted(Comparator.comparingLong(p -> -(p.getSold() != null ? p.getSold() : 0L)))
                    .limit(MAX_PRODUCTS)
                    .map(p -> String.format(
                            "%d. %s | Giá: %,.0fđ | Thương hiệu: %s | Danh mục: %s | ⭐%.1f | Đã bán: %d",
                            p.getId(),
                            nvl(p.getName()),
                            p.getPrice() != null ? p.getPrice() : 0,
                            p.getTradeMark() != null ? nvl(p.getTradeMark().getName()) : "N/A",
                            p.getCategory() != null ? nvl(p.getCategory().getName()) : "N/A",
                            p.getAvgStar() != null ? p.getAvgStar() : 0.0,
                            p.getSold() != null ? p.getSold() : 0L))
                    .collect(Collectors.joining("\n"));

            // --- 2. Xử lý URL ảnh ---
            String imageUrl = null;
            String cleanMsg = userMessage;
            Matcher m = IMAGE_URL_PATTERN.matcher(userMessage);
            if (m.find()) {
                imageUrl = m.group(1);
                cleanMsg = userMessage.replaceAll("\\[URL_IMAGE:\\s*https?://\\S+\\]", "").trim();
                if (cleanMsg.isEmpty())
                    cleanMsg = "Mô tả điện thoại trong ảnh này cho tôi";
            }

            // --- 3. Xây dựng nội dung tin nhắn user (kèm ảnh nếu có) ---
            String userContent = cleanMsg;
            if (imageUrl != null) {
                userContent += "\n[Ảnh đính kèm: " + imageUrl + "]";
            }

            // --- 4. Tạo system prompt ---
            String systemPrompt = "Bạn là trợ lý AI tư vấn bán điện thoại di động. Hãy trả lời bằng tiếng Việt, ngắn gọn và thân thiện.\n\n"
                    +
                    "QUY TẮC:\n" +
                    "- Dùng **text** để in đậm từ quan trọng\n" +
                    "- Dùng danh sách với dấu - cho nhiều mục\n" +
                    "- Link sản phẩm dùng định dạng: http://localhost:8080/detail?id=[ID]\n" +
                    "- Nếu câu hỏi không liên quan điện thoại, vẫn trả lời lịch sự\n" +
                    "- Trả lời tối đa 300 từ\n\n" +
                    "DANH SÁCH SẢN PHẨM HIỆN CÓ:\n" +
                    (productData.isEmpty() ? "(Chưa có sản phẩm)" : productData);

            // --- 5. Xây dựng messages array (OpenAI format) ---
            JsonArray messages = new JsonArray();

            // System message
            JsonObject sysMsg = new JsonObject();
            sysMsg.addProperty("role", "system");
            sysMsg.addProperty("content", systemPrompt);
            messages.add(sysMsg);

            // Lịch sử hội thoại (giới hạn MAX_HISTORY lượt gần nhất)
            int start = Math.max(0, history.size() - MAX_HISTORY);
            for (int i = start; i < history.size(); i++) {
                JsonObject msg = new JsonObject();
                msg.addProperty("role", history.get(i)[0]);
                msg.addProperty("content", history.get(i)[1]);
                messages.add(msg);
            }

            // Tin nhắn hiện tại của user
            JsonObject curMsg = new JsonObject();
            curMsg.addProperty("role", "user");
            curMsg.addProperty("content", userContent);
            messages.add(curMsg);

            // --- 6. Tạo request body ---
            JsonObject body = new JsonObject();
            body.addProperty("model", GROQ_MODEL);
            body.add("messages", messages);
            body.addProperty("max_tokens", 600);
            body.addProperty("temperature", 0.7);

            // --- 7. Gửi request tới Groq ---
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(GROQ_URL))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + groqApiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(body.toString()))
                    .build();

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            // --- 8. Xử lý phản hồi ---
            JsonObject json = JsonParser.parseString(response.body()).getAsJsonObject();

            if (json.has("choices")) {
                String reply = json.getAsJsonArray("choices")
                        .get(0).getAsJsonObject()
                        .getAsJsonObject("message")
                        .get("content").getAsString();

                // Lưu lịch sử: user + assistant
                history.add(new String[] { "user", userContent });
                history.add(new String[] { "assistant", reply });
                // Giới hạn lịch sử tổng
                while (history.size() > MAX_HISTORY * 2)
                    history.remove(0);
                session.setAttribute("groq-history", history);

                return reply;

            } else if (json.has("error")) {
                JsonObject err = json.getAsJsonObject("error");
                String errMsg = err.has("message") ? err.get("message").getAsString() : "Lỗi không xác định";
                return "❌ Lỗi Groq: " + errMsg;
            } else {
                return "⚠️ Không nhận được phản hồi hợp lệ.";
            }

        } catch (Exception e) {
            e.printStackTrace();
            return "❌ Lỗi hệ thống: " + e.getMessage();
        }
    }

    private String nvl(String s) {
        return s != null ? s : "";
    }
}