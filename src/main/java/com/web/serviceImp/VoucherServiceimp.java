package com.web.serviceImp;

import com.web.entity.Voucher;
import com.web.exception.MessageException;
import com.web.repository.InvoiceRepository;
import com.web.repository.VoucherRepository;
import com.web.servive.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.sql.Date;
import java.util.List;
import java.util.Optional;

@Component
public class VoucherServiceimp implements VoucherService {

    @Autowired
    private VoucherRepository voucherRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Override
    public Voucher create(Voucher voucher) {
        Optional<Voucher> ex = voucherRepository.findByCode(voucher.getCode());
        if(ex.isPresent()){
            throw new MessageException("Mã voucher đã tồn tại");
        }
        Voucher result = voucherRepository.save(voucher);
        return result;
    }

    @Override
    public Voucher update(Voucher voucher) {
        Optional<Voucher> ex = voucherRepository.findByCode(voucher.getCode());
        if(ex.isPresent()){
            if(ex.get().getId() != voucher.getId()){
                throw new MessageException("Mã voucher đã tồn tại");
            }
        }
        Voucher result = voucherRepository.save(voucher);
        return result;
    }

    @Override
    public void delete(Long id) {
        invoiceRepository.setNullVoucher(id);
        voucherRepository.deleteById(id);
    }

    @Override
    public List<Voucher> findAll(Date start, Date end) {
        if(start == null || end == null){
            start = Date.valueOf("2000-01-01");
            end = Date.valueOf("2200-01-01");
        }
        List<Voucher> list = voucherRepository.findByDate(start,end);
        return list;
    }

    @Override
    public Page<Voucher> findAll(Date start, Date end, Pageable pageable) {
        if(start == null || end == null){
            start = Date.valueOf("2000-01-01");
            end = Date.valueOf("2200-01-01");
        }
        Page<Voucher> page = voucherRepository.findByDate(start,end,pageable);
        return page;
    }

    @Override
    public Optional<Voucher> findById(Long id) {
        Optional<Voucher> ex = voucherRepository.findById(id);
        if(ex.isEmpty()){
            throw new MessageException("Not found");
        }
        return ex;
    }

    @Override
    public void block(Long id) {
        Optional<Voucher> ex = voucherRepository.findById(id);
        if(ex.isEmpty()){
            throw new MessageException("Not found");
        }
        if (ex.get().getBlock() == true) {
            ex.get().setBlock(false);
        } else {
            ex.get().setBlock(true);
        }
        voucherRepository.save(ex.get());
    }

    @Override
    public Optional<Voucher> findByCode(String code, Double amount) {
        Optional<Voucher> ex = voucherRepository.findByCode(code);
        if(ex.isEmpty()){
            throw new MessageException("Mã voucher không khả dụng");
        }
        if(ex.get().getBlock() == true){
            throw new MessageException("Mã voucher không thể sử dụng");
        }
        Date now = new Date(System.currentTimeMillis());
        if(!((ex.get().getStartDate().before(now) || ex.get().getStartDate().equals(now))
                && (ex.get().getEndDate().after(now) || ex.get().getEndDate().equals(now)))){
            throw new MessageException("Mã voucher đã hết hạn");
        }
        if(ex.get().getMinAmount() > amount){
            throw new MessageException("Số tiền đơn hàng chưa đủ, hãy mua thêm "+(ex.get().getMinAmount() - amount)+" để được áp dụng voucher");
        }
        return ex;
    }
}
