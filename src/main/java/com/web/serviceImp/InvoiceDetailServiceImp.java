package com.web.serviceImp;

import com.web.dto.response.InvoiceDetailResponse;
import com.web.entity.Invoice;
import com.web.entity.InvoiceDetail;
import com.web.entity.User;
import com.web.exception.MessageException;
import com.web.mapper.InvoiceDetailMapper;
import com.web.repository.InvoiceDetailRepository;
import com.web.servive.InvoiceDetailService;
import com.web.utils.UserUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Component
public class InvoiceDetailServiceImp implements InvoiceDetailService {

    @Autowired
    private InvoiceDetailRepository invoiceDetailRepository;

    @Autowired
    private InvoiceDetailMapper invoiceDetailMapper;

    @Autowired
    private UserUtils userUtils;

    @Override
    public List<InvoiceDetailResponse> findByInvoice(Long idInvoice) {
        List<InvoiceDetail> list = invoiceDetailRepository.findByInvoiceId(idInvoice);
        List<InvoiceDetailResponse> result = new ArrayList<>();
        for (InvoiceDetail d : list) {
            result.add(invoiceDetailMapper.invoiceDetailToResponse(d));
        }
        return result;
    }

    private Long getCurrentSellerShopId() {
        User currentUser = userUtils.getUserWithAuthority();

        if (currentUser == null) {
            throw new MessageException("Bạn chưa đăng nhập");
        }

        if (currentUser.getAuthorities() == null || currentUser.getAuthorities().getName() == null) {
            throw new MessageException("Không xác định được quyền");
        }

        if (!"ROLE_SELLER".equals(currentUser.getAuthorities().getName())) {
            throw new MessageException("Chỉ seller mới được phép");
        }

        if (currentUser.getShop() == null) {
            throw new MessageException("Tài khoản chưa có shop");
        }

        return currentUser.getShop().getId();
    }

    @Override
    public List<InvoiceDetailResponse> findByInvoiceForSeller(Long idInvoice) {
        Long shopId = getCurrentSellerShopId();

        List<InvoiceDetail> list = invoiceDetailRepository.findByInvoiceIdAndShopId(idInvoice, shopId);
        List<InvoiceDetailResponse> responses = new ArrayList<>();

        for (InvoiceDetail d : list) {
            responses.add(invoiceDetailMapper.invoiceDetailToResponse(d));
        }
        return responses;
    }

}
