package com.web.api;

import com.web.dto.request.SellerRegisterRequest;
import com.web.entity.Shop;
import com.web.entity.User;
import com.web.repository.ShopRepository;
import com.web.repository.UserRepository;
import com.web.servive.SellerService;
import com.web.utils.UserUtils;

import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/seller")
@CrossOrigin
public class SellerApi {

    private final SellerService sellerService;
    private final UserRepository userRepository;
    private final UserUtils userUtils;
    private final ShopRepository shopRepository;

    public SellerApi(SellerService sellerService,
            UserRepository userRepository,
            UserUtils userUtils,
            ShopRepository shopRepository) {
        this.sellerService = sellerService;
        this.userRepository = userRepository;
        this.userUtils = userUtils;
        this.shopRepository = shopRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerSeller(@RequestBody SellerRegisterRequest request,
            Authentication authentication) {

        String username = authentication.getName();

        Optional<User> optionalUser = userRepository.findById(Long.valueOf(username));

        if (optionalUser.isEmpty()) {
            throw new RuntimeException("User không tồn tại");
        }

        User user = optionalUser.get();

        Shop shop = sellerService.registerSeller(user.getId(), request);

        return ResponseEntity.ok(shop);
    }

    @GetMapping("/public/my-seller-status")
    public ResponseEntity<?> mySellerStatus() {

        User user = userUtils.getUserWithAuthority();

        if (user == null) {
            return ResponseEntity.ok("NONE");
        }

        Optional<Shop> shopOpt = shopRepository.findFirstByOwnerId(user.getId());

        if (shopOpt.isEmpty()) {
            return ResponseEntity.ok("NONE");
        }

        Shop shop = shopOpt.get();

        return ResponseEntity.ok(shop.getStatus().name());
    }
}