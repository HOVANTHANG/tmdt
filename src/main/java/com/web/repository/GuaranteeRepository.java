package com.web.repository;

import com.web.entity.Guarantee;
import com.web.enums.GuaranteeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GuaranteeRepository extends JpaRepository<Guarantee, Long> {

    @Query("select g from Guarantee g where g.user.id = ?1 order by g.id desc ")
    List<Guarantee> findByUser(Long id);

    @Query("SELECT g FROM Guarantee g WHERE g.invoiceDetail.id = :invoiceDetailId AND g.guaranteeStatus IN :statuses")
    List<Guarantee> findExistingInProgressGuarantee(
            @Param("invoiceDetailId") Long invoiceDetailId,
            @Param("statuses") List<GuaranteeStatus> statuses
    );

    @Query("SELECT g FROM Guarantee g WHERE " +
            "LOWER(g.code) LIKE %:text% OR " +
            "LOWER(g.productName) LIKE %:text% OR " +
            "LOWER(g.customerName) LIKE %:text% OR " +
            "LOWER(g.customerPhone) LIKE %:text% OR " +
            "LOWER(g.imei) LIKE %:text% OR " +
            "LOWER(g.description) LIKE %:text%")
    Page<Guarantee> findByText(@Param("text") String text, Pageable pageable);
}
