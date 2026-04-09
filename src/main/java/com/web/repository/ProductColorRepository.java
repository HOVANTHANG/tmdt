package com.web.repository;

import com.web.entity.Category;
import com.web.entity.Product;
import com.web.entity.ProductColor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ProductColorRepository extends JpaRepository<ProductColor,Long> {

    @Query("select p from ProductColor p where p.productStorage.id = ?1")
    List<ProductColor> findByStorage(Long storage);

    @Query("select cast(sum(p.quantity) as int) from ProductColor p")
    Integer totalProduct();


}
