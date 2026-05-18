package com.web.api;

import com.web.dto.response.ShopApprovalResponse;
import com.web.entity.Authority;
import com.web.entity.Shop;
import com.web.entity.User;
import com.web.enums.ShopStatus;
import com.web.repository.AuthorityRepository;
import com.web.repository.ShopRepository;
import com.web.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/seller")
public class SellerAdminApi {

    private final ShopRepository shopRepository;
    private final UserRepository userRepository;
    private final AuthorityRepository authorityRepository;

    public SellerAdminApi(ShopRepository shopRepository,
            UserRepository userRepository,
            AuthorityRepository authorityRepository) {
        this.shopRepository = shopRepository;
        this.userRepository = userRepository;
        this.authorityRepository = authorityRepository;
    }

    @GetMapping("/pending")
    public ResponseEntity<?> pending() {
        List<ShopApprovalResponse> response = shopRepository.findByStatus(ShopStatus.PENDING)
                .stream()
                .map(this::mapShop)
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/detail/{id}")
    public ResponseEntity<?> detail(@PathVariable Long id) {
        Shop shop = shopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy shop"));

        return ResponseEntity.ok(mapShop(shop));
    }

    @PostMapping("/approve/{id}")
    public ResponseEntity<?> approve(@PathVariable Long id) {
        Shop shop = shopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy shop"));

        User owner = shop.getOwner();

        Authority sellerRole = authorityRepository.findById("ROLE_SELLER")
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ROLE_SELLER"));

        owner.setAuthorities(sellerRole);
        owner.setShop(shop);
        userRepository.save(owner);

        shop.setStatus(ShopStatus.APPROVED);
        shopRepository.save(shop);

        return ResponseEntity.ok("Đã duyệt shop");
    }

    @PostMapping("/reject/{id}")
    public ResponseEntity<?> reject(@PathVariable Long id) {
        Shop shop = shopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy shop"));

        shop.setStatus(ShopStatus.REJECTED);
        shopRepository.save(shop);

        return ResponseEntity.ok("Đã từ chối shop");
    }

    private ShopApprovalResponse mapShop(Shop shop) {
        ShopApprovalResponse dto = new ShopApprovalResponse();

        dto.setId(shop.getId());
        dto.setShopName(shop.getShopName());
        dto.setShopSlug(shop.getShopSlug());
        dto.setPhone(shop.getPhone());
        dto.setEmail(shop.getEmail());
        dto.setDescription(shop.getDescription());
        dto.setAvatar(shop.getAvatar());
        dto.setStatus(shop.getStatus() != null ? shop.getStatus().name() : "");

        if (shop.getOwner() != null) {
            dto.setOwnerId(shop.getOwner().getId());
            dto.setOwnerUsername(shop.getOwner().getUsername());
            dto.setOwnerFullname(shop.getOwner().getFullname());
            dto.setOwnerEmail(shop.getOwner().getEmail());
        }

        return dto;
    }
}