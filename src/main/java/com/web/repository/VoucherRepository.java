package com.web.repository;

import com.web.entity.UserAddress;
import com.web.entity.Voucher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.sql.Date;
import java.util.List;
import java.util.Optional;

public interface VoucherRepository extends JpaRepository<Voucher,Long> {

    @Query("select v from Voucher v where v.code = ?1 and v.startDate <= ?2 and v.endDate >= ?2 and v.block = false ")
    public Optional<Voucher> findByCode(String code, Date now);

    @Query("select v from Voucher v where v.code = ?1 ")
    public Optional<Voucher> findByCode(String code);

    @Query("select v from Voucher v where v.startDate >= ?1 and v.endDate <= ?2")
    public List<Voucher> findByDate(Date start, Date end);


    @Query("select v from Voucher v where v.startDate >= ?1 and v.endDate <= ?2")
    public Page<Voucher> findByDate(Date start, Date end, Pageable pageable);
}
