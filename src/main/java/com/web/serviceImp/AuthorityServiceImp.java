package com.web.serviceImp;

import com.web.entity.Authority;
import com.web.repository.AuthorityRepository;
import com.web.servive.AuthorityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AuthorityServiceImp implements AuthorityService {

    @Autowired
    private AuthorityRepository authorityRepository;

    @Override
    public List<Authority> findAll() {
        return authorityRepository.findAll();
    }
}
