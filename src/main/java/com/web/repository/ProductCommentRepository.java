package com.web.repository;

import com.web.entity.ProductComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductCommentRepository extends JpaRepository<ProductComment, Long> {

    boolean existsByUserIdAndInvoiceDetailId(Long userId, Long invoiceDetailId);

    List<ProductComment> findByProductIdOrderByIdDesc(Long productId);

    Optional<ProductComment> findByUserIdAndInvoiceDetailId(Long userId, Long invoiceDetailId);
}