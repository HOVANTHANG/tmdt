package com.web.servive;

import com.web.dto.request.InvoiceRequest;
import com.web.dto.response.InvoiceResponse;
import com.web.entity.Invoice;
import com.web.enums.PayType;
import com.web.enums.StatusInvoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.util.List;

@Service
public interface InvoiceService {

        public InvoiceResponse create(InvoiceRequest invoiceRequest);

        public InvoiceResponse updateStatus(Long invoiceId, StatusInvoice statusInvoice);

        public List<InvoiceResponse> findByUser();

        public Page<InvoiceResponse> findAll(Date from, Date to, Pageable pageable);

        public InvoiceResponse cancelInvoice(Long invoiceId);

        public InvoiceResponse findById(Long invoiceId);

        public InvoiceResponse findByIdForAdmin(Long invoiceId);

        public InvoiceResponse timKiemDonHang(Long id, String phone);

        public Page<InvoiceResponse> findAllFull(Date from, Date to, PayType payType, StatusInvoice statusInvoice,
                        Pageable pageable);

        public Page<InvoiceResponse> searchInvoice(String q, Pageable pageable);

        Page<Invoice> findInvoiceBySellerShop(String from, String to, PayType payType, StatusInvoice status,
                        Pageable pageable, String sort);

        Invoice findByIdForSeller(Long idInvoice);

        void updateStatusForSeller(Long idInvoice, StatusInvoice status);

        Page<Invoice> searchInvoiceForSeller(String q, Pageable pageable);

        Long getLatestIdForSeller();

}
