package com.web.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum GuaranteeStatus {

    ACCEPT("Đã tiếp nhận yêu cầu","#2eaee6"),
    RECEIVED("Đã tiếp nhận máy từ khách","#3498DB"),
    IN_PROGRESS("Đang xử lý/Kiểm tra lỗi","#F39C12"),
    PENDING_PARTS("Đang chờ linh kiện thay thế","#E74C3C"),
    COMPLETED("Đã xử lý xong (chờ khách đến nhận)","#2ECC71"),
    RETURNED_TO_CUSTOMER("Đã giao lại máy cho khách","#16A085"),
    CANCELED("Hủy bỏ bảo hành","#95A5A6"),
    REJECTED("Từ chối bảo hành","#C0392B");

    private final String label;

    private final String color;
}
