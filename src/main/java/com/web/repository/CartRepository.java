package com.web.repository;

import com.web.entity.Blog;
import com.web.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart,Long> {

    @Modifying
    @Transactional
    @Query("delete from Cart p where p.user.id = ?1")
    int deleteByUser(Long userId);

    @Query("select c from Cart c where c.user.id = ?1")
    List<Cart> findByUser(Long userId);

    @Query("select c from Cart c where c.user.id = ?1 and c.productColor.id = ?2")
    Optional<Cart> findByColorAndUser(Long userId, Long idColor);

    @Query("select count(c.id) from Cart c where c.user.id = ?1")
    Long countCart(Long userId);
}
