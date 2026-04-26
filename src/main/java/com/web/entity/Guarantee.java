package com.web.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.web.enums.GuaranteeStatus;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "guarantee")
@Getter
@Setter
@EntityListeners(AuditingEntityListener.class)
public class Guarantee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    private String code;

    @CreatedDate
    @Column(updatable = false)
    @JsonFormat(pattern = "HH:mm dd/MM/yy")
    private LocalDateTime createdDate;

    private String productName;

    private String productVariantTier1;

    private String productVariantTier2;
    private Long productId;

    private String imei;

    private String description;

    private String errorDiagnosis;

    private Integer fee = 0;

    private String customerName;

    private String customerPhone;

    @Enumerated(EnumType.STRING)
    private GuaranteeStatus guaranteeStatus;

    @ManyToOne
    private User user;

    @ManyToOne
    private InvoiceDetail invoiceDetail;

    @OneToMany(mappedBy = "guarantee", cascade = CascadeType.REMOVE)
    @JsonManagedReference
    private List<GuaranteeHistory> guaranteeHistories = new ArrayList<>();

    public String getLabel() {
        return guaranteeStatus.getLabel();
    }

    public String getColor() {
        return guaranteeStatus.getColor();
    }
}
