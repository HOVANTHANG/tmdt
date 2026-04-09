package com.web.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginDto {

    private String username;

    private String password;

    private String tokenFcm;
}
