package com.web.servive;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.web.dto.request.TokenDto;
import com.web.dto.response.UserDto;
import com.web.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public interface UserService {

    public TokenDto login(String username, String password, String tokenFcm)  throws Exception;

    public User regisUser(User user);

    public User addAccount(User user, String role);


    public void activeAccount(String activationKey, String email);

    public Boolean checkUser(Optional<User> users);

    public Page<UserDto> getUserByRole(String search,String role, Pageable pageable);

    public void changePass(String oldPass, String newPass);

    public void forgotPassword(String email);

    public void guiYeuCauQuenMatKhau(String email);

    public void xacNhanDatLaiMatKhau(String email, String password, String key);

    TokenDto loginWithGoogle(GoogleIdToken.Payload payload);
}
