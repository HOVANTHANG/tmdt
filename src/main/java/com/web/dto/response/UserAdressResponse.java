package com.web.dto.response;

import com.web.entity.User;
import com.web.entity.Wards;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import java.sql.Date;

@Getter
@Setter
public class UserAdressResponse {

    private Long id;

    private String fullname;

    private String phone;

    private String streetName;

    private Boolean primaryAddres;

    private Wards wards;

    private UserDto user;

    private Date createdDate;
}
