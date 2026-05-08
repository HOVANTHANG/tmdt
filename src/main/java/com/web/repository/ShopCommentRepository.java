package com.web.repository;

import com.web.entity.ShopComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShopCommentRepository extends JpaRepository<ShopComment, Long> {

    boolean existsByUserIdAndInvoiceIdAndShopId(Long userId, Long invoiceId, Long shopId);

    List<ShopComment> findByShopIdOrderByIdDesc(Long shopId);

    Optional<ShopComment> findByUserIdAndInvoiceIdAndShopId(Long userId, Long invoiceId, Long shopId);
}