package com.web.repository;

import com.web.entity.Shop;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShopRepository extends JpaRepository<Shop, Long> {

    boolean existsByShopSlug(String shopSlug);

    boolean existsByOwnerId(Long ownerId);
}