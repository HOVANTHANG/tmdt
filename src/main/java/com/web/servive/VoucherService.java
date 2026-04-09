package com.web.servive;

import com.web.entity.Voucher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.util.List;
import java.util.Optional;

@Service
public interface VoucherService {

    public Voucher create(Voucher voucher);

    public Voucher update(Voucher voucher);

    public void delete(Long id);

    public List<Voucher> findAll(Date start, Date end);

    public Page<Voucher> findAll(Date start, Date end,Pageable pageable);

    public Optional<Voucher> findById(Long id);

    public void block(Long id);

    public Optional<Voucher> findByCode(String code, Double amount);

}
