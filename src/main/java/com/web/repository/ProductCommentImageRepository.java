package com.web.repository;

import com.web.entity.ProductComment;
import com.web.entity.ProductCommentImage;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductCommentImageRepository extends JpaRepository<ProductCommentImage, Long> {

    List<ProductCommentImage> findByProductCommentId(Long productCommentId);
}
