package com.web.repository;

import com.web.entity.Shop;
import com.web.enums.ShopStatus;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShopRepository extends JpaRepository<Shop, Long> {

    boolean existsByShopSlug(String shopSlug);

    boolean existsByOwnerId(Long ownerId);

    List<Shop> findByStatus(ShopStatus status);

    Optional<Shop> findFirstByOwnerId(Long ownerId);

    @Query("select s from Shop s where s.status = ?1")
    List<Shop> findAllByStatus(ShopStatus status);

}