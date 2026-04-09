package com.web.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Table(name = "product_color")
@Getter
@Setter
public class ProductColor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    private String name;

    private String image;

    private Double price;

    private Integer quantity;

    @ManyToOne
    @JoinColumn(name = "product_storage_id")
    @JsonBackReference
    private ProductStorage productStorage;
}
