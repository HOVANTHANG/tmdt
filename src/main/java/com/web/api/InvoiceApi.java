package com.web.api;
import com.web.dto.request.InvoiceRequest;
import com.web.dto.response.InvoiceResponse;
import com.web.entity.Category;
import com.web.enums.PayType;
import com.web.enums.StatusInvoice;
import com.web.servive.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.sql.Date;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/invoice")
@CrossOrigin
public class InvoiceApi {

    @Autowired
    private InvoiceService invoiceService;

    @PostMapping("/user/create")
    public ResponseEntity<?> save(@RequestBody InvoiceRequest invoiceRequest){
        InvoiceResponse result = invoiceService.create(invoiceRequest);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @GetMapping("/user/find-by-user")
    public ResponseEntity<?> findByUser(){
        List<InvoiceResponse> result = invoiceService.findByUser();
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/user/find-by-id")
    public ResponseEntity<?> findByUser(@RequestParam("idInvoice") Long idInvoice){
        InvoiceResponse result = invoiceService.findById(idInvoice);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/admin/find-by-id")
    public ResponseEntity<?> findByAdmin(@RequestParam("idInvoice") Long idInvoice){
        InvoiceResponse result = invoiceService.findById(idInvoice);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/admin/find-all")
    public ResponseEntity<?> findAll(@RequestParam(value = "from",required = false) Date from,
                                     @RequestParam(value = "to",required = false) Date to,
                                     @RequestParam(value = "paytype",required = false) PayType payType,
                                     @RequestParam(value = "status",required = false) StatusInvoice statusInvoice, Pageable pageable){
        Page<InvoiceResponse> result = invoiceService.findAllFull(from, to,payType, statusInvoice,pageable);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/admin/all-status")
    public ResponseEntity<?> allStatus(){
        List<StatusInvoice> result = Arrays.stream(StatusInvoice.class.getEnumConstants()).toList();
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @PostMapping("/admin/update-status")
    public ResponseEntity<?> updateStatus(@RequestParam("idInvoice") Long idInvoice, @RequestParam("status") StatusInvoice statusInvoice){
        InvoiceResponse result = invoiceService.updateStatus(idInvoice, statusInvoice);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @PostMapping("/admin/update-imei")
    public ResponseEntity<?> updateImei(@RequestParam Long detailId, @RequestParam String imei){
        invoiceService.updateImei(detailId, imei);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @GetMapping("/public/tim-kiem-don-hang")
    public ResponseEntity<?> timKiemDonHang(@RequestParam("id") Long id, @RequestParam("phone") String phone){
        InvoiceResponse result = invoiceService.timKiemDonHang(id, phone);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }
    @GetMapping("/admin/search")
    public ResponseEntity<?> searchInvoice(
            @RequestParam("q") String q,
            Pageable pageable
    ) {
        Page<InvoiceResponse> result = invoiceService.searchInvoice(q, pageable);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

}
