package com.web.serviceImp;

import com.web.entity.Voucher;
import com.web.exception.MessageException;
import com.web.repository.InvoiceRepository;
import com.web.repository.VoucherRepository;
import com.web.servive.VoucherService;
import com.web.utils.UserUtils;
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

    @Autowired
    private UserUtils userUtils;

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

    @Override
    public Voucher createForSeller(Voucher voucher) {
        com.web.entity.User currentUser = userUtils.getUserWithAuthority();
        if (currentUser == null || currentUser.getShop() == null) {
            throw new MessageException("Tài khoản seller chưa có shop");
        }
        Optional<Voucher> ex = voucherRepository.findByCode(voucher.getCode());
        if (ex.isPresent()) {
            throw new MessageException("Mã voucher đã tồn tại");
        }
        voucher.setShop(currentUser.getShop());
        return voucherRepository.save(voucher);
    }

    @Override
    public Voucher updateForSeller(Voucher voucher) {
        com.web.entity.User currentUser = userUtils.getUserWithAuthority();
        if (currentUser == null || currentUser.getShop() == null) {
            throw new MessageException("Tài khoản seller chưa có shop");
        }
        // Kiểm tra voucher này có thuộc shop của seller không
        Voucher exist = voucherRepository.findById(voucher.getId())
                .orElseThrow(() -> new MessageException("Không tìm thấy voucher"));
        if (exist.getShop() == null || !exist.getShop().getId().equals(currentUser.getShop().getId())) {
            throw new MessageException("Bạn không có quyền chỉnh sửa voucher này");
        }
        // Kiểm tra trùng mã
        Optional<Voucher> duplicate = voucherRepository.findByCode(voucher.getCode());
        if (duplicate.isPresent() && !duplicate.get().getId().equals(voucher.getId())) {
            throw new MessageException("Mã voucher đã tồn tại");
        }
        // Giữ nguyên shop, không cho đổi
        voucher.setShop(currentUser.getShop());
        return voucherRepository.save(voucher);
    }

    @Override
    public void deleteForSeller(Long id) {
        com.web.entity.User currentUser = userUtils.getUserWithAuthority();
        if (currentUser == null || currentUser.getShop() == null) {
            throw new MessageException("Tài khoản seller chưa có shop");
        }
        Voucher exist = voucherRepository.findById(id)
                .orElseThrow(() -> new MessageException("Không tìm thấy voucher"));
        if (exist.getShop() == null || !exist.getShop().getId().equals(currentUser.getShop().getId())) {
            throw new MessageException("Bạn không có quyền xóa voucher này");
        }
        invoiceRepository.setNullVoucher(id);
        voucherRepository.deleteById(id);
    }

    @Override
    public Page<Voucher> findAllBySeller(Date start, Date end, Pageable pageable) {
        com.web.entity.User currentUser = userUtils.getUserWithAuthority();
        if (currentUser == null || currentUser.getShop() == null) {
            throw new MessageException("Tài khoản seller chưa có shop");
        }
        if (start == null || end == null) {
            start = Date.valueOf("2000-01-01");
            end   = Date.valueOf("2200-01-01");
        }
        return voucherRepository.findByShopAndDate(currentUser.getShop().getId(), start, end, pageable);
    }

    @Override
    public List<Voucher> findAllListBySeller(Date start, Date end) {
        com.web.entity.User currentUser = userUtils.getUserWithAuthority();
        if (currentUser == null || currentUser.getShop() == null) {
            throw new MessageException("Tài khoản seller chưa có shop");
        }
        if (start == null || end == null) {
            start = Date.valueOf("2000-01-01");
            end   = Date.valueOf("2200-01-01");
        }
        return voucherRepository.findByShopAndDate(currentUser.getShop().getId(), start, end);
    }
}
