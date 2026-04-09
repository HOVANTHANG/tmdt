package com.web.entity;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.sql.Date;

@Entity
@Table(name = "blog")
@Getter
@Setter
public class Blog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    private Date createdDate;

    private String title;

    private String description;

    private String content;

    private Boolean primaryBlog;

    private String imageBanner;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

}
