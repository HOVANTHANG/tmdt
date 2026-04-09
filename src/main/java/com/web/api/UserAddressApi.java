package com.web.api;

import com.web.dto.request.UserAdressRequest;
import com.web.dto.response.UserAdressResponse;
import com.web.entity.Category;
import com.web.servive.UserAddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/user-address")
@CrossOrigin
public class UserAddressApi {

    @Autowired
    private UserAddressService userAddressService;

    @PostMapping("/user/create")
    public ResponseEntity<?> save(@Valid @RequestBody UserAdressRequest userAdressRequest, BindingResult bindingResult){
        if(bindingResult.hasErrors()){
            return new ResponseEntity<>(bindingResult.getAllErrors(), HttpStatus.BAD_REQUEST);
        }
        UserAdressResponse result = userAddressService.create(userAdressRequest);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @PostMapping("/user/update")
    public ResponseEntity<?> update(@Valid @RequestBody UserAdressRequest userAdressRequest, BindingResult bindingResult){
        if(bindingResult.hasErrors()){
            return new ResponseEntity<>(bindingResult.getAllErrors(), HttpStatus.BAD_REQUEST);
        }
        UserAdressResponse result = userAddressService.update(userAdressRequest);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @DeleteMapping("/user/delete")
    public ResponseEntity<?> delete(@RequestParam("id") Long id){
        userAddressService.delete(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/user/my-address")
    public ResponseEntity<?> findAll(Pageable pageable){
        List<UserAdressResponse> result = userAddressService.findByUser();
        return new ResponseEntity<>(result,HttpStatus.OK);
    }

    @GetMapping("/user/findById")
    public ResponseEntity<?> findById(@RequestParam("id") Long id){
        UserAdressResponse result = userAddressService.findById(id);
        return new ResponseEntity<>(result,HttpStatus.OK);
    }

}
