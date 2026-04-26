package com.web.repository;

import com.web.entity.Category;
import com.web.entity.InvoiceDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface InvoiceDetailRepository extends JpaRepository<InvoiceDetail, Long> {

        @Query("select i from InvoiceDetail i where i.invoice.id = ?1")
        public List<InvoiceDetail> findByInvoiceId(Long invoiceId);

        @Query("select i from InvoiceDetail i where i.id <> ?1 and i.imei = ?2")
        Long findByIdAndImei(Long detailId, String imei);

        @Query("select coalesce(sum(d.price * d.quantity), 0) " +
                        "from InvoiceDetail d " +
                        "where d.productVariant.product.shop.id = ?1 " +
                        "and month(d.invoice.createdDate) = month(current_date) " +
                        "and year(d.invoice.createdDate) = year(current_date) " +
                        "and d.invoice.statusInvoice <> com.web.enums.StatusInvoice.DA_HUY")
        Double revenueThisMonthByShop(Long shopId);

        @Query("select coalesce(sum(d.price * d.quantity), 0) " +
                        "from InvoiceDetail d " +
                        "where d.productVariant.product.shop.id = ?1 " +
                        "and d.invoice.createdDate = current_date " +
                        "and d.invoice.statusInvoice <> com.web.enums.StatusInvoice.DA_HUY")
        Double revenueTodayByShop(Long shopId);

        @Query("select count(distinct d.invoice.id) " +
                        "from InvoiceDetail d " +
                        "where d.productVariant.product.shop.id = ?1 " +
                        "and d.invoice.createdDate = current_date " +
                        "and d.invoice.statusInvoice = com.web.enums.StatusInvoice.DA_NHAN")
        Long invoiceDoneTodayByShop(Long shopId);

        @Query("select count(distinct d.invoice.id) " +
                        "from InvoiceDetail d " +
                        "where d.productVariant.product.shop.id = ?1 " +
                        "and d.invoice.statusInvoice <> com.web.enums.StatusInvoice.DA_HUY")
        Long totalInvoiceByShop(Long shopId);

        @Query("select count(distinct d.invoice.id) " +
                        "from InvoiceDetail d " +
                        "where d.productVariant.product.shop.id = ?1 " +
                        "and d.invoice.statusInvoice = com.web.enums.StatusInvoice.DA_NHAN")
        Long totalInvoiceDoneByShop(Long shopId);

        @Query("select month(d.invoice.createdDate), coalesce(sum(d.price * d.quantity), 0) " +
                        "from InvoiceDetail d " +
                        "where d.productVariant.product.shop.id = ?1 " +
                        "and year(d.invoice.createdDate) = ?2 " +
                        "and d.invoice.statusInvoice <> com.web.enums.StatusInvoice.DA_HUY " +
                        "group by month(d.invoice.createdDate) " +
                        "order by month(d.invoice.createdDate)")
        List<Object[]> revenueByMonthOfYearAndShop(Long shopId, Integer year);

        @Query("select count(d) > 0 from InvoiceDetail d " +
                        "where d.invoice.id = ?1 and d.productVariant.product.shop.id = ?2")
        boolean existsByInvoiceIdAndShopId(Long invoiceId, Long shopId);

        @Query("select d from InvoiceDetail d " +
                        "where d.invoice.id = ?1 and d.productVariant.product.shop.id = ?2")
        List<InvoiceDetail> findByInvoiceIdAndShopId(Long invoiceId, Long shopId);
}
