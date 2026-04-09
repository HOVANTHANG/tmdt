package com.web.serviceImp;

import com.web.dto.request.UserAdressRequest;
import com.web.dto.response.UserAdressResponse;
import com.web.entity.User;
import com.web.entity.UserAddress;
import com.web.exception.MessageException;
import com.web.mapper.UserAddressMapper;
import com.web.repository.InvoiceRepository;
import com.web.repository.UserAddressRepository;
import com.web.servive.UserAddressService;
import com.web.utils.UserUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.sql.Date;
import java.util.List;
import java.util.Optional;

@Component
public class UserAddressServiceImp implements UserAddressService {

    @Autowired
    private UserAddressRepository userAddressRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private UserUtils userUtils;

    @Autowired
    private UserAddressMapper userAddressMapper;

    @Override
    public List<UserAdressResponse> findByUser() {
        User user = userUtils.getUserWithAuthority();
        List<UserAddress> userAddresses = userAddressRepository.findByUser(user.getId());
        List<UserAdressResponse> responses = userAddressMapper.listUserAddToListResponse(userAddresses);
        return responses;
    }

    @Override
    public UserAdressResponse findById(Long id) {
        Optional<UserAddress> userAddress = userAddressRepository.findById(id);
        if(userAddress.isEmpty()){
            throw new MessageException("user address not found");
        }
        if(userUtils.getUserWithAuthority().getId() != userAddress.get().getUser().getId()){
            throw new MessageException("access denied");
        }
        return userAddressMapper.userAdressToUserAddResponse(userAddress.get());
    }

    @Override
    public UserAdressResponse create(UserAdressRequest userAdressRequest) {
        if(userAdressRequest.getId() != null){
            throw new MessageException("id must null");
        }
        User user = userUtils.getUserWithAuthority();
        UserAddress userAddress = userAddressMapper.requestToUserAddress(userAdressRequest);
        userAddress.setUser(user);
        userAddress.setCreatedDate(new Date(System.currentTimeMillis()));
        if(userAddress.getPrimaryAddres() == true){
            userAddressRepository.unSetPrimary(user.getId());
        }
        UserAddress result = userAddressRepository.save(userAddress);
        return userAddressMapper.userAdressToUserAddResponse(result);
    }

    @Override
    public UserAdressResponse update(UserAdressRequest userAdressRequest) {
        if(userAdressRequest.getId() == null){
            throw new MessageException("id require");
        }
        Optional<UserAddress> userAddress = userAddressRepository.findById(userAdressRequest.getId());
        if(userAddress.isEmpty()){
            throw new MessageException("user address not found");
        }
        if(userUtils.getUserWithAuthority().getId() != userAddress.get().getUser().getId()){
            throw new MessageException("access denied");
        }
        UserAddress userAddress1 = userAddressMapper.requestToUserAddress(userAdressRequest);
        userAddress1.setUser(userAddress.get().getUser());
        userAddress1.setCreatedDate(userAddress.get().getCreatedDate());
        if(userAddress1.getPrimaryAddres() == true){
            userAddressRepository.unSetPrimary(userAddress.get().getUser().getId());
        }
        UserAddress result = userAddressRepository.save(userAddress1);
        return userAddressMapper.userAdressToUserAddResponse(result);
    }

    @Override
    public void delete(Long id) {
        Optional<UserAddress> userAddress = userAddressRepository.findById(id);
        if(userAddress.isEmpty()){
            throw new MessageException("user address not found");
        }
        if(userUtils.getUserWithAuthority().getId() != userAddress.get().getUser().getId()){
            throw new MessageException("access denied");
        }
        invoiceRepository.setNull(id);
        userAddressRepository.deleteById(id);
    }
}
