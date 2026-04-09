package com.web.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Table(name = "product_comment_image")
@Getter
@Setter
public class ProductCommentImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    private String linkImage;

    @ManyToOne
    @JoinColumn(name = "product_comment_id")
    @JsonBackReference
    private ProductComment productComment;
}
