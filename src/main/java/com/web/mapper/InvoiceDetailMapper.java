package com.web.mapper;

import com.web.dto.response.InvoiceDetailResponse;
import com.web.entity.InvoiceDetail;
import org.springframework.stereotype.Component;

@Component
public class InvoiceDetailMapper {

    public InvoiceDetailResponse invoiceDetailToResponse(InvoiceDetail invoiceDetail) {
        InvoiceDetailResponse response = new InvoiceDetailResponse();

        response.setId(invoiceDetail.getId());
        response.setInvoice(invoiceDetail.getInvoice());
        response.setImei(invoiceDetail.getImei());
        response.setPrice(invoiceDetail.getPrice());
        response.setQuantity(invoiceDetail.getQuantity());

        if (invoiceDetail.getProductVariant() != null) {
            response.setProductVariant(invoiceDetail.getProductVariant());
            response.setProduct(invoiceDetail.getProductVariant().getProduct());
        }

        return response;
    }
}