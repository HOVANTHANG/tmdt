package com.web.servive;

import com.web.dto.request.SellerRegisterRequest;
import com.web.entity.Authority;
import com.web.entity.Shop;
import com.web.entity.User;
import com.web.enums.ShopStatus;
import com.web.repository.AuthorityRepository;
import com.web.repository.ShopRepository;
import com.web.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SellerService {

    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final AuthorityRepository authorityRepository;

    public SellerService(UserRepository userRepository,
            ShopRepository shopRepository,
            AuthorityRepository authorityRepository) {
        this.userRepository = userRepository;
        this.shopRepository = shopRepository;
        this.authorityRepository = authorityRepository;
    }

    @Transactional
    public Shop registerSeller(Long userId, SellerRegisterRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        if (shopRepository.existsByOwnerId(userId)) {
            throw new RuntimeException("Tài khoản này đã có shop");
        }

        if (shopRepository.existsByShopSlug(request.getShopSlug())) {
            throw new RuntimeException("shopSlug đã tồn tại");
        }

        Shop shop = new Shop();

        shop.setShopName(request.getShopName());
        shop.setShopSlug(request.getShopSlug());
        shop.setPhone(request.getPhone());
        shop.setEmail(request.getEmail());
        shop.setDescription(request.getDescription());
        shop.setAvatar(request.getAvatar());

        shop.setOwner(user);

        // CHỜ ADMIN DUYỆT
        shop.setStatus(ShopStatus.PENDING);

        return shopRepository.save(shop);
    }
}