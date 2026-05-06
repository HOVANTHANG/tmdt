package com.web.repository;

import com.web.entity.Product;
import com.web.enums.CategoryType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

        @Query("select p from Product p where " +
                        "(p.name like ?1 or p.category.name like ?1 or p.tradeMark.name like ?1 or p.code like ?1) " +
                        "and p.deleted <> true")
        Page<Product> findByParam(String s, Pageable pageable);

        @Query("select p from Product p where " +
                        "(p.name like ?1 or p.category.name like ?1 or p.tradeMark.name like ?1 or p.code like ?1) " +
                        "and p.category.id = ?2 and p.deleted <> true")
        Page<Product> findByParamAndCate(String s, Long categoryId, Pageable pageable);

        @Query("select p from Product p where " +
                        "(p.name like ?1 or p.category.name like ?1 or p.tradeMark.name like ?1 or p.code like ?1) " +
                        "and p.tradeMark.id = ?2 and p.deleted <> true")
        Page<Product> findByParamAndTrademark(String s, Long trademarkId, Pageable pageable);

        @Query("select p from Product p where " +
                        "(p.name like ?1 or p.category.name like ?1 or p.tradeMark.name like ?1 or p.code like ?1) " +
                        "and p.tradeMark.id = ?2 and p.category.id = ?3 and p.deleted <> true")
        Page<Product> findByParamAndTrademarkAndCate(String s, Long trademarkId, Long categoryId, Pageable pageable);

        @Query("select p from Product p where p.deleted <> true order by p.createdDate desc, p.createdTime desc")
        Page<Product> newProduct(Pageable pageable);

        @Query("select p from Product p where p.deleted <> true and p.category.id = ?1")
        Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

        @Query("select p from Product p where p.deleted <> true order by p.quantitySold desc")
        Page<Product> bestSaler(Pageable pageable);

        @Query("select p from Product p where p.deleted <> true and p.category.categoryType = ?1 order by p.quantitySold desc")
        Page<Product> bestSalerByCategory(CategoryType categoryType, Pageable pageable);

        @Query("select p from Product p where p.deleted <> true and p.tradeMark.id = ?1 and p.id <> ?2")
        Page<Product> sanPhamLienQuanByTrademark(Long idTrademark, Long idproduct, Pageable pageable);

        @Query("select p from Product p where p.deleted <> true and p.category.id = ?1 and p.id <> ?2")
        Page<Product> sanPhamLienQuanCate(Long idcategory, Long idproduct, Pageable pageable);

        @Query("select p from Product p where p.deleted <> true and p.name like ?1 and p.price >= ?2 and p.price <= ?3")
        Page<Product> locSanPham(String search, Double small, Double large, Pageable pageable);

        @Query("select p from Product p where p.deleted <> true and p.name like ?1 and p.price >= ?2 and p.price <= ?3 and p.category.id = ?4")
        Page<Product> locSanPham(String search, Double small, Double large, Long idcategory, Pageable pageable);

        @Query("select p from Product p where p.deleted <> true and p.name like ?1 and p.price >= ?2 and p.price <= ?3 and p.tradeMark.name = ?4")
        Page<Product> locSanPham(String search, Double small, Double large, String trademark, Pageable pageable);

        @Query("select p from Product p where p.deleted <> true and p.name like ?1 and p.price >= ?2 and p.price <= ?3 "
                        +
                        "and p.tradeMark.name = ?4 and p.category.id = ?5")
        Page<Product> locSanPham(String search, Double small, Double large, String trademark, Long idCategory,
                        Pageable pageable);

        @Query(value = "select * from product p where p.deleted <> true order by p.quantity_sold desc limit 10", nativeQuery = true)
        List<Product> findTop10Selling();

        @Query("select count(p) from Product p where p.shop.id = ?1 and p.deleted <> true")
        Long countByShopIdAndDeletedFalse(Long shopId);

        @Query(value = "select * from product p " +
                        "where p.shop_id = ?1 and p.deleted <> true " +
                        "order by p.quantity_sold desc limit 10", nativeQuery = true)
        List<Product> findTopSellingByShop(Long shopId);

        @Query("select p from Product p where p.deleted <> true and p.shop.id = ?1 " +
                        "and (p.name like ?2 or p.category.name like ?2 or p.tradeMark.name like ?2 or p.code like ?2)")
        Page<Product> findByShop(Long shopId, String search, Pageable pageable);

        @Query("select p from Product p where p.deleted <> true and p.shop.id = ?1 " +
                        "and (p.name like ?2 or p.category.name like ?2 or p.tradeMark.name like ?2 or p.code like ?2) "
                        +
                        "and p.category.id = ?3")
        Page<Product> findByShopAndCategory(Long shopId, String search, Long categoryId, Pageable pageable);

        @Query("select p from Product p where p.deleted <> true and p.shop.id = ?1 " +
                        "and (p.name like ?2 or p.category.name like ?2 or p.tradeMark.name like ?2 or p.code like ?2) "
                        +
                        "and p.tradeMark.id = ?3")
        Page<Product> findByShopAndTrademark(Long shopId, String search, Long trademarkId, Pageable pageable);

        @Query("select p from Product p where p.deleted <> true and p.shop.id = ?1 " +
                        "and (p.name like ?2 or p.category.name like ?2 or p.tradeMark.name like ?2 or p.code like ?2) "
                        +
                        "and p.category.id = ?3 and p.tradeMark.id = ?4")
        Page<Product> findByShopAndCategoryAndTrademark(Long shopId, String search, Long categoryId, Long trademarkId,
                        Pageable pageable);

        Page<Product> findByShopIdAndDeletedFalse(Long shopId, Pageable pageable);

        Page<Product> findByCategoryIdAndDeletedFalse(Long categoryId, Pageable pageable);

        Long countByShopId(Long shopId);

}