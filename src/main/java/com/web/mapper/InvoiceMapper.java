package com.web.mapper;

import com.web.dto.request.InvoiceRequest;
import com.web.dto.response.InvoiceResponse;
import com.web.entity.Category;
import com.web.entity.Invoice;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.sql.Date;
import java.sql.Time;
import java.util.ArrayList;
import java.util.List;

@Component
public class InvoiceMapper {

    @Autowired
    private ModelMapper mapper;

    @Autowired
    private UserAddressMapper userAddressMapper;

    public Invoice invoiceRequestToInvoice(InvoiceRequest request){
        Invoice invoice = mapper.map(request, Invoice.class);
        invoice.setCreatedDate(new Date(System.currentTimeMillis()));
        invoice.setCreatedTime(new Time(System.currentTimeMillis()));
        return invoice;
    }

    public InvoiceResponse invoiceToInvoiceResponse(Invoice invoice){
        InvoiceResponse response = mapper.map(invoice, InvoiceResponse.class);
        response.setUserAddress(userAddressMapper.userAdressToUserAddResponse(invoice.getUserAddress()));
        return response;
    }

    public List<InvoiceResponse> invoiceListToInvoiceResponseList(List<Invoice> list){
        List<InvoiceResponse> result = new ArrayList<>();
        for(Invoice i : list){
            result.add(invoiceToInvoiceResponse(i));
        }
        return result;
    }

}
