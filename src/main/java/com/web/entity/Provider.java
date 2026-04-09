package com.web.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Column;
import javax.persistence.Table;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Entity
@Table(name = "providers")
@Getter
@Setter
public class Provider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tên nhà cung cấp không được để trống")
    @Size(max = 100)
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Địa chỉ không được để trống")
    @Size(max = 255)
    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "phone_number", length = 15)
    private String phoneNumber;

    @Email(message = "Địa chỉ email không hợp lệ")
    @Size(max = 100)
    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "is_active")
    private Boolean isActive = true;
}