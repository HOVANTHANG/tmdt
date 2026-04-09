package com.web.repository;

import com.web.entity.ProductStorage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductStorageRepository extends JpaRepository<ProductStorage, Long> {

    @Query("select p from ProductStorage p where p.product.id = ?1")
    public List<ProductStorage> findByProduct(Long id);
}
