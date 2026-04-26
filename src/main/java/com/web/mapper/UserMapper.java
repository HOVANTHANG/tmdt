package com.web.mapper;

import com.web.dto.request.UserRequest;
import com.web.dto.response.UserDto;
import com.web.entity.User;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class UserMapper {

    @Autowired
    private ModelMapper mapper;

    public UserDto userToUserDto(User user) {
        UserDto dto = mapper.map(user, UserDto.class);

        // map role
        if (user.getAuthorities() != null) {
            dto.setRole(user.getAuthorities().getName());
        }

        // map shop
        if (user.getShop() != null) {
            dto.setShopId(user.getShop().getId());
            dto.setShopName(user.getShop().getShopName());
        }

        return dto;
    }

    public User userRequestToUser(UserRequest request) {
        User user = mapper.map(request, User.class);
        user.setUsername(request.getEmail());
        return user;
    }

    public List<UserDto> listUserToListUserDto(List<User> list) {
        return list.stream()
                .map(this::userToUserDto)
                .collect(Collectors.toList());
    }
}