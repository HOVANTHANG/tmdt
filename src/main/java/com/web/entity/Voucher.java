package com.web.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.sql.Date;

@Entity
@Table(name = "voucher")
@Getter
@Setter
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    private String code;

    private String name;

    private Double discount;

    private Double minAmount;

    private Date startDate;

    private Date endDate;

    private Boolean block;

    private Integer quantity;
}
