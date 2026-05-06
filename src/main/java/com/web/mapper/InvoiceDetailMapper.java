package com.web.mapper;

import com.web.dto.response.InvoiceDetailResponse;
import com.web.entity.InvoiceDetail;
import com.web.entity.Shop;
import org.springframework.stereotype.Component;

@Component
public class InvoiceDetailMapper {

    public InvoiceDetailResponse invoiceDetailToResponse(InvoiceDetail invoiceDetail) {

        InvoiceDetailResponse response = new InvoiceDetailResponse();

        response.setId(invoiceDetail.getId());

        response.setInvoice(invoiceDetail.getInvoice());

        response.setImportPrice(invoiceDetail.getImportPrice());

        response.setPrice(invoiceDetail.getPrice());

        response.setQuantity(invoiceDetail.getQuantity());

        // PRODUCT + VARIANT
        if (invoiceDetail.getProductVariant() != null) {

            response.setProductVariant(invoiceDetail.getProductVariant());

            response.setProduct(
                    invoiceDetail.getProductVariant().getProduct());

            // SHOP
            Shop shop = invoiceDetail.getProductVariant()
                    .getProduct()
                    .getShop();

            if (shop != null) {

                response.setShopId(shop.getId());

                response.setShopName(shop.getShopName());

                response.setShopAvatar(shop.getAvatar());
            }
        }

        return response;
    }
}