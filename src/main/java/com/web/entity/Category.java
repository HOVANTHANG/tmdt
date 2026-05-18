package com.web.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.web.enums.CategoryType;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "category")
@Getter
@Setter
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    private String name;

    private CategoryType categoryType;

    @Column(name = "image")
    private String image;

    @Column(name = "deleted")
    private Boolean deleted = false;

    // Quan hệ cha - con
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    @JsonIgnore
    private Category parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Category> children = new ArrayList<>();

    // Expose parentId trong JSON (không gây circular reference)
    @JsonProperty("parentId")
    public Long getParentId() {
        return parent != null ? parent.getId() : null;
    }

    // Nhận parentId từ request body và set vào parent
    @JsonProperty("parentId")
    public void setParentId(Long parentId) {
        if (parentId != null) {
            Category p = new Category();
            p.setId(parentId);
            this.parent = p;
        } else {
            this.parent = null;
        }
    }
}
