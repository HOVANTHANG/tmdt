package com.web.servive;

import com.web.entity.Authority;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface AuthorityService {

    public List<Authority> findAll();

}
