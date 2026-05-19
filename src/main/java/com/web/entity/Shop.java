package com.web.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.web.enums.ShopStatus;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "shops")
@Getter
@Setter
public class Shop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "shop_name")
    private String shopName;

    @Column(name = "shop_slug")
    private String shopSlug;

    private String phone;

    private String email;

    private Double avgStar = 0D;
    private Long reviewCount = 0L;
    private Long totalSold = 0L;

    @Column(columnDefinition = "TEXT")
    private String description;
    @Column(name = "avatar")
    private String avatar;
    @ManyToOne
    @JoinColumn(name = "owner_user_id")
    @JsonIgnore
    private User owner;

    @Enumerated(EnumType.STRING)
    private ShopStatus status;

    /** Tỉ lệ chiết khấu admin thu từ mỗi đơn hàng (%). Mặc định 5%. */
    @Column(name = "commission_rate")
    private Double commissionRate = 5.0;

    @OneToMany(mappedBy = "shop")
    @JsonIgnore
    private List<Product> products = new ArrayList<>();
}