package com.web.servive;

import com.web.dto.request.SellerRegisterRequest;
import com.web.entity.Authority;
import com.web.entity.Shop;
import com.web.entity.User;
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

        if (user.getAuthorities() != null
                && "ROLE_SELLER".equals(user.getAuthorities().getName())) {
            throw new RuntimeException("Tài khoản này đã là nhà bán hàng");
        }

        if (shopRepository.existsByOwnerId(userId)) {
            throw new RuntimeException("Tài khoản này đã có shop");
        }

        if (shopRepository.existsByShopSlug(request.getShopSlug())) {
            throw new RuntimeException("shopSlug đã tồn tại");
        }

        Authority sellerRole = authorityRepository.findById("ROLE_SELLER")
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ROLE_SELLER"));

        user.setAuthorities(sellerRole);
        userRepository.save(user);

        Shop shop = new Shop();
        shop.setShopName(request.getShopName());
        shop.setShopSlug(request.getShopSlug());
        shop.setPhone(request.getPhone());
        shop.setEmail(request.getEmail());
        shop.setDescription(request.getDescription());
        shop.setOwner(user);

        return shopRepository.save(shop);
    }
}