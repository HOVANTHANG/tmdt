package com.web.repository;

import com.web.entity.Category;
import com.web.entity.InvoiceDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface InvoiceDetailRepository extends JpaRepository<InvoiceDetail,Long> {

    @Query("select i from InvoiceDetail i where i.invoice.id = ?1")
    public List<InvoiceDetail> findByInvoiceId(Long invoiceId);

    @Query("select i from InvoiceDetail i where i.id <> ?1 and i.imei = ?2")
    Long findByIdAndImei(Long detailId, String imei);
}
