package com.web.repository;
import com.web.entity.Product;
import com.web.enums.CategoryType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
public interface ProductRepository extends JpaRepository<Product,Long> {

    @Query("select p from Product p where " +
            "(p.name like ?1 or p.category.name like ?1 or p.tradeMark.name like ?1 or p.code like ?1) and p.deleted <> true")
    public Page<Product> findByParam(String s, Pageable pageable);

    @Query("select p from Product p where " +
            "(p.name like ?1 or p.category.name like ?1 or p.tradeMark.name like ?1 or p.code like ?1) " +
            "and p.category.id = ?2 and p.deleted <> true")
    public Page<Product> findByParamAndCate(String s, Long categoryId, Pageable pageable);

    @Query("select p from Product p where " +
            "(p.name like ?1 or p.category.name like ?1 or p.tradeMark.name like ?1 or p.code like ?1) " +
            "and p.tradeMark.id = ?2 and p.deleted <> true")
    public Page<Product> findByParamAndTrademark(String s, Long trademarkId, Pageable pageable);

    @Query("select p from Product p where " +
            "(p.name like ?1 or p.category.name like ?1 or p.tradeMark.name like ?1 or p.code like ?1) " +
            "and p.tradeMark.id = ?2 and p.category.id = ?3 and p.deleted <> true")
    public Page<Product> findByParamAndTrademarkAndCate(String s, Long trademarkId, Long categoryId, Pageable pageable);

    @Query("select p from Product p where p.deleted <> true")
    Page<Product> newProduct(Pageable pageable);

    @Query("select p from Product p where p.deleted <> true and p.category.categoryType = ?1")
    Page<Product> phuKien(CategoryType categoryType, Pageable pageable);

    @Query("select p from Product p where p.deleted <> true and p.category.categoryType = ?1")
    Page<Product> bestSaler(CategoryType categoryType, Pageable pageable);


    @Query("select p from Product p where p.deleted <> true and p.category.categoryType = ?1 and p.tradeMark.id = ?2 and p.id <> ?3")
    Page<Product> sanPhamLienQuan(CategoryType categoryType, Long idTrademark, Long idproduct, Pageable pageable);

    @Query("select p from Product p where p.deleted <> true and p.category.id = ?1 and p.id <> ?2")
    Page<Product> sanPhamLienQuanCate(Long idcategory, Long idproduct, Pageable pageable);


    @Query("select p from Product p where p.deleted <> true and p.name like ?1 and p.price >= ?2 and p.price <= ?3")
    Page<Product> locSanPham(String search, Double small, Double large,Pageable pageable);

    @Query("select p from Product p where p.deleted <> true and p.name like ?1 and p.price >= ?2 and p.price <= ?3 and p.category.id = ?4")
    Page<Product> locSanPham(String search, Double small, Double large, Long idcategory,Pageable pageable);

    @Query("select p from Product p where p.deleted <> true and p.name like ?1 and p.price >= ?2 and p.price <= ?3 and p.tradeMark.name = ?4")
    Page<Product> locSanPham(String search, Double small, Double large, String trademark,Pageable pageable);

    @Query("select p from Product p where p.deleted <> true and p.name like ?1 and p.price >= ?2 and p.price <= ?3 and " +
            "p.tradeMark.name = ?4 and p.category.id = ?5")
    Page<Product> locSanPham(String search, Double small, Double large, String trademark, Long idCategory,Pageable pageable);

    @Query(value = "select * from product p order by p.quantity_sold desc limit 10", nativeQuery = true)
    List<Product> findTop10Selling();
}
