package com.web.repository;

import com.web.entity.ImportProduct;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;

public interface ImportProductRepository extends JpaRepository<ImportProduct,Long> {

    @Query("select i from ImportProduct i where i.importDate >= ?1 and i.importDate <= ?2")
    public Page<ImportProduct> findByDate(Date from, Date to, Pageable pageable);

    @Query("select i from ImportProduct i where i.importDate >= ?1 and i.importDate <= ?2 and i.productColor.productStorage.product.id = ?3")
    public Page<ImportProduct> findByDateAndProduct(Date from, Date to, Long idProduct, Pageable pageable);
}