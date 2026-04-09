package com.web.mapper;

import com.web.dto.request.InvoiceRequest;
import com.web.dto.response.InvoiceDetailResponse;
import com.web.entity.Invoice;
import com.web.entity.InvoiceDetail;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.sql.Date;
import java.sql.Time;

@Component
public class InvoiceDetailMapper {


    @Autowired
    private ModelMapper mapper;

    @Autowired
    private ProductMapper productMapper;

    public InvoiceDetailResponse invoiceDetailToResponse(InvoiceDetail invoiceDetail){
        InvoiceDetailResponse response = new InvoiceDetailResponse();
        response.setProductColor(invoiceDetail.getProductColor());
        response.setProduct(invoiceDetail.getProductColor().getProductStorage().getProduct());
        response.setInvoice(invoiceDetail.getInvoice());
        response.setId(invoiceDetail.getId());
        response.setImei(invoiceDetail.getImei());
        response.setProductStorage(invoiceDetail.getProductColor().getProductStorage());
        response.setPrice(invoiceDetail.getPrice());
        response.setQuantity(invoiceDetail.getQuantity());
        return response;
    }
}
