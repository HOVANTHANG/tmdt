package com.web.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Table(name = "cart")
@Getter
@Setter
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    private Integer quantity;

    @ManyToOne
    @JoinColumn(name = "product_color_id")
    private ProductColor productColor;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
