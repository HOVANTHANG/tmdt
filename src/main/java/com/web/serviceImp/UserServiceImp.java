package com.web.serviceImp;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.web.dto.response.CustomUserDetails;
import com.web.dto.request.TokenDto;
import com.web.dto.response.UserDto;
import com.web.entity.Authority;
import com.web.entity.User;
import com.web.enums.UserType;
import com.web.exception.MessageException;
import com.web.jwt.JwtTokenProvider;
import com.web.mapper.UserMapper;
import com.web.repository.AuthorityRepository;
import com.web.repository.UserRepository;
import com.web.servive.UserService;
import com.web.utils.CommonPage;
import com.web.utils.Contains;
import com.web.utils.MailService;
import com.web.utils.UserUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.sql.Date;
import java.util.*;

@Component
public class UserServiceImp implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthorityRepository authorityRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private MailService mailService;

    @Autowired
    private UserUtils userUtils;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private CommonPage commonPage;


    @Override
    public TokenDto login(String username, String password, String tokenFcm) throws Exception {
        Optional<User> users = userRepository.findByUsername(username);
        // check infor user
        checkUser(users);
        if(passwordEncoder.matches(password, users.get().getPassword())){
            CustomUserDetails customUserDetails = new CustomUserDetails(users.get());
            String token = jwtTokenProvider.generateToken(customUserDetails);
            TokenDto tokenDto = new TokenDto();
            tokenDto.setToken(token);
            tokenDto.setUser(userMapper.userToUserDto(users.get()));
            if(tokenFcm != null){
                if (!tokenFcm.equals("")){
                    users.get().setTokenFcm(tokenFcm);
                    userRepository.save(users.get());
                }
            }
            return tokenDto;
        }
        else{
            throw new MessageException("Mật khẩu không chính xác", 400);
        }
    }


    @Override
    public User regisUser(User user) {
        userRepository.findByEmail(user.getEmail())
                .ifPresent(exist->{
                    if(exist.getActivation_key() != null){
                        throw new MessageException("Tài khoản chưa được kích hoạt", 330);
                    }
                    throw new MessageException("Email đã được sử dụng", 400);
                });
        user.setCreatedDate(new Date(System.currentTimeMillis()));
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setActived(false);
        user.setActivation_key(userUtils.randomKey());
        Authority authority = authorityRepository.findById(Contains.ROLE_USER).get();
        user.setAuthorities(authority);
        User result = userRepository.save(user);
        mailService.sendEmail(user.getEmail(), "Xác nhận tài khoản của bạn","Cảm ơn bạn đã tin tưởng và xử dụng dịch vụ của chúng tôi:<br>" +
                "Để kích hoạt tài khoản của bạn, hãy nhập mã xác nhận bên dưới để xác thực tài khoản của bạn<br><br>" +
                "<a style=\"background-color: #2f5fad; padding: 10px; color: #fff; font-size: 18px; font-weight: bold;\">"+user.getActivation_key()+"</a>",false, true);
        return result;
    }

    @Override
    public User addAccount(User user, String role) {
        userRepository.findByEmail(user.getEmail())
                .ifPresent(exist->{
                    if(exist.getActivation_key() != null){
                        throw new MessageException("Tài khoản chưa được kích hoạt", 330);
                    }
                    throw new MessageException("Ẻmail đã được sử dụng", 400);
                });
        user.setCreatedDate(new Date(System.currentTimeMillis()));
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setActived(true);
        Authority authority = authorityRepository.findById(role).get();
        user.setAuthorities(authority);
        User result = userRepository.save(user);
        return result;
    }

    // kich hoat tai khoan
    @Override
    public void activeAccount(String activationKey, String email) {
        Optional<User> user = userRepository.getUserByActivationKeyAndEmail(activationKey, email);
        user.ifPresent(exist->{
            exist.setActivation_key(null);
            exist.setActived(true);
            userRepository.save(exist);
            return;
        });
        if(user.isEmpty()){
            throw new MessageException("email hoặc mã xác nhận không chính xác", 404);
        }
    }

    @Override
    public Boolean checkUser(Optional<User> users){
        if(users.isPresent() == false){
            throw new MessageException("Không tìm thấy tài khoản", 404);
        }
        else if(users.get().getActivation_key() != null && users.get().getActived() == false){
            throw new MessageException("Tài khoản chưa được kích hoạt", 300);
        }
        else if(users.get().getActived() == false && users.get().getActivation_key() == null){
            throw new MessageException("Tài khoản đã bị khóa", 500);
        }
        return true;
    }

    @Override
    public Page<UserDto> getUserByRole(String search,String role, Pageable pageable) {
        Page<User> page = null;
        if(role != null){
            page = userRepository.getUserByRole(search,role, pageable);
        }
        else{
            page = userRepository.findAll(search,pageable);
        }
        List<UserDto> list = userMapper.listUserToListUserDto(page.getContent());
        Page<UserDto> result = commonPage.restPage(page, list);
        return result;
    }

    @Override
    public void changePass(String oldPass, String newPass) {
        User user = userUtils.getUserWithAuthority();
        if(isValidPassword(newPass) == false){
            throw new MessageException("Mật khẩu phải có ít nhất 1 chữ hoa, ký tự đặc biệt và chữ viết thường");
        }
        if(passwordEncoder.matches(oldPass, user.getPassword())){
            if(passwordEncoder.matches(newPass, user.getPassword())){
                throw new MessageException("Mật khẩu mới không được trùng với mật khảu cũ");
            }
            user.setPassword(passwordEncoder.encode(newPass));
            userRepository.save(user);
        }
        else{
            throw new MessageException("Invalid password", 500);
        }
    }

    public boolean isValidPassword(String password) {
        String regex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?\":{}|<>])\\S{8,}$";
        return password.matches(regex);
    }

    @Override
    public void forgotPassword(String email) {
        Optional<User> users = userRepository.findByEmail(email);
        // check infor user
        checkUser(users);
        String randomPass = userUtils.randomPass();
        users.get().setPassword(passwordEncoder.encode(randomPass));
        userRepository.save(users.get());
        mailService.sendEmail(email, "Quên mật khẩu","Cảm ơn bạn đã tin tưởng và xử dụng dịch vụ của chúng tôi:<br>" +
                "Chúng tôi đã tạo một mật khẩu mới từ yêu cầu của bạn<br>" +
                "Tuyệt đối không được chia sẻ mật khẩu này với bất kỳ ai. Bạn hãy thay đổi mật khẩu ngay sau khi đăng nhập<br><br>" +
                "<a style=\"background-color: #2f5fad; padding: 10px; color: #fff; font-size: 18px; font-weight: bold;\">"+randomPass+"</a>",false, true);

    }

    @Override
    public void guiYeuCauQuenMatKhau(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        checkUser(user);
        String random = userUtils.randomKey();
        user.get().setRememberKey(random);
        userRepository.save(user.get());

        mailService.sendEmail(email, "Đặt lại mật khẩu","Cảm ơn bạn đã tin tưởng và xử dụng dịch vụ của chúng tôi:<br>" +
                "Chúng tôi đã tạo một mật khẩu mới từ yêu cầu của bạn<br>" +
                "Hãy lick vào bên dưới để đặt lại mật khẩu mới của bạn<br><br>" +
                "<a href='http://localhost:8080/datlaimatkhau?email="+email+"&key="+random+"' style=\"background-color: #2f5fad; padding: 10px; color: #fff; font-size: 18px; font-weight: bold;\">Đặt lại mật khẩu</a>",false, true);

    }

    @Override
    public void xacNhanDatLaiMatKhau(String email, String password, String key) {
        Optional<User> user = userRepository.findByEmail(email);
        checkUser(user);
        if(user.get().getRememberKey().equals(key)){
            user.get().setPassword(passwordEncoder.encode(password));
            userRepository.save(user.get());
        }
        else{
            throw new MessageException("Mã xác thực không chính xác");
        }
    }

    @Override
    public TokenDto loginWithGoogle(GoogleIdToken.Payload payload) {
        User user = new User();
        user.setEmail(payload.getEmail());
        user.setFullname(payload.get("name").toString());
        user.setActived(true);
        user.setAuthorities(authorityRepository.findByName(Contains.ROLE_USER));
        user.setCreatedDate(new Date(System.currentTimeMillis()));
        user.setUserType(UserType.GOOGLE);

        Optional<User> users = userRepository.findByEmail(user.getEmail());
        // check infor user

        if(users.isPresent()){
            if(users.get().getActived() == false){
                throw new MessageException("Tài khoản đã bị khóa");
            }
            CustomUserDetails customUserDetails = new CustomUserDetails(users.get());
            String token = jwtTokenProvider.generateToken(customUserDetails);
            TokenDto tokenDto = new TokenDto();
            tokenDto.setToken(token);
            tokenDto.setUser(userMapper.userToUserDto(users.get()));
            return tokenDto;
        }
        else{
            User u = userRepository.save(user);
            CustomUserDetails customUserDetails = new CustomUserDetails(u);
            String token = jwtTokenProvider.generateToken(customUserDetails);
            TokenDto tokenDto = new TokenDto();
            tokenDto.setToken(token);
            tokenDto.setUser(userMapper.userToUserDto(u));
            return tokenDto;
        }
    }
}
