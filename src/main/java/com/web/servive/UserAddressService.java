package com.web.servive;

import com.web.dto.request.UserAdressRequest;
import com.web.dto.response.UserAdressResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface UserAddressService {

    public List<UserAdressResponse> findByUser();

    public UserAdressResponse findById(Long id);

    public UserAdressResponse create(UserAdressRequest userAdressRequest);

    public UserAdressResponse update(UserAdressRequest userAdressRequest);

    public void delete(Long id);

}
