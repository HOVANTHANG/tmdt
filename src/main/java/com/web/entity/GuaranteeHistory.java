package com.web.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.web.enums.GuaranteeStatus;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "guarantee_history")
@Getter
@Setter
@EntityListeners(AuditingEntityListener.class)
public class GuaranteeHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @CreatedDate
    @Column(updatable = false)
    @JsonFormat(pattern = "HH:mm dd/MM/yy")
    private LocalDateTime createdDate;

    @Enumerated(EnumType.STRING)
    private GuaranteeStatus guaranteeStatus;

    @ManyToOne
    @JsonBackReference
    private Guarantee guarantee;

    public String getLabel(){
        return guaranteeStatus.getLabel();
    }

    public String getColor(){
        return guaranteeStatus.getColor();
    }
}
