package com.web.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.Table;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.sql.Date;

@Entity
@Table(name = "user_address")
@Getter
@Setter
public class UserAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    private String fullname;

    private String phone;

    private String streetName;

    private Boolean primaryAddres;

    private Date createdDate;

    @ManyToOne
    @JoinColumn(name = "ward_id")
    private Wards wards;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
