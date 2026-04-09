package com.web.dto.request;

import lombok.Data;

@Data
public class GuaranteeRequest {

    private String description;

    private Long invoiceDetailId;

    private String customerName;

    private String customerPhone;
}
