package com.web.repository;

import com.web.entity.Category;
import com.web.entity.Invoice;
import com.web.entity.Product;
import com.web.enums.PayType;
import com.web.enums.StatusInvoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
        @Query("""
                        select distinct i from Invoice i
                        left join InvoiceDetail d on d.invoice.id = i.id
                        where
                            i.phone like %?1%
                            or i.receiverName like %?1%
                        """)
        Page<Invoice> searchInvoice(String q, Pageable pageable);

        @Modifying
        @Transactional
        @Query("update Invoice i set i.userAddress = null where i.userAddress.id = ?1")
        int setNull(Long userAdressId);

        @Modifying
        @Transactional
        @Query("update Invoice i set i.voucher = null where i.voucher.id = ?1")
        int setNullVoucher(Long voucherId);

        @Query("select i from Invoice i where i.userAddress.user.id = ?1")
        public List<Invoice> findByUser(Long userId);

        @Query("select i from Invoice i where i.createdDate >= ?1 and i.createdDate <= ?2")
        public Page<Invoice> findByDate(Date from, Date to, Pageable pageable);

        @Query("select i from Invoice i where i.createdDate >= ?1 and i.createdDate <= ?2 and i.payType = ?3")
        public Page<Invoice> findByDateAndPaytype(Date from, Date to, PayType payType, Pageable pageable);

        @Query(value = "select sum(i.total_amount) from invoice i where Month(i.created_date) = ?1 and Year(i.created_date) = ?2 and (i.pay_type = 0 or i.status_invoice = ?3)", nativeQuery = true)
        public Double calDt(Integer thang, Integer month, Integer index);

        @Query(value = "select sum(i.total_amount) from invoice i \n" +
                        "WHERE (i.status_invoice = ?2 or i.pay_type = 0 ) and i.created_date = ?1", nativeQuery = true)
        public Double revenueByDate(Date ngay, Integer index);

        @Query(value = "select count(i.id) from invoice i\n" +
                        "where i.status_invoice = ?2 and i.status_update_date = ?1", nativeQuery = true)
        public Double numInvoiceToDay(Date ngay, Integer index);

        @Query("select i from Invoice i where i.createdDate >= ?1 and i.createdDate <= ?2 and i.statusInvoice = ?3")
        public Page<Invoice> findByDateAndStatus(Date from, Date to, StatusInvoice status, Pageable pageable);

        @Query("select i from Invoice i where i.createdDate >= ?1 and i.createdDate <= ?2 and i.payType = ?3 and i.statusInvoice = ?4")
        public Page<Invoice> findByDateAndPaytypeAndStatus(Date from, Date to, PayType payType, StatusInvoice status,
                        Pageable pageable);

        @Query("select distinct i from Invoice i " +
                        "where exists (" +
                        "   select d.id from InvoiceDetail d " +
                        "   where d.invoice.id = i.id and d.productVariant.product.shop.id = ?1" +
                        ")")
        Page<Invoice> findBySellerShop(Long shopId, Pageable pageable);

        @Query("select distinct i from Invoice i " +
                        "where exists (" +
                        "   select d.id from InvoiceDetail d " +
                        "   where d.invoice.id = i.id " +
                        "   and d.productVariant.product.shop.id = :shopId" +
                        ") " +
                        "and (:payType is null or i.payType = :payType) " +
                        "and (:status is null or i.statusInvoice = :status)")
        Page<Invoice> findBySellerShopFilter(@Param("shopId") Long shopId,
                        @Param("payType") PayType payType,
                        @Param("status") StatusInvoice status,
                        Pageable pageable);

        @Query("select distinct i from Invoice i " +
                        "where exists (" +
                        "   select d.id from InvoiceDetail d " +
                        "   where d.invoice.id = i.id " +
                        "   and d.productVariant.product.shop.id = ?1 " +
                        "   and (str(i.id) like ?2 or i.receiverName like ?2 or i.phone like ?2)" +
                        ")")
        Page<Invoice> searchBySellerShop(Long shopId, String q, Pageable pageable);

        @Query(value = "SELECT COALESCE(MAX(i.id), 0) FROM invoice i " +
                        "WHERE EXISTS (SELECT 1 FROM invoice_detail d " +
                        "  JOIN product_variant pv ON d.product_variant_id = pv.id " +
                        "  JOIN product p ON pv.product_id = p.id " +
                        "  WHERE d.invoice_id = i.id AND p.shop_id = ?1)", nativeQuery = true)
        Long findLatestIdByShopId(Long shopId);

}
