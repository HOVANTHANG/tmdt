package com.web.servive;

import com.web.dto.request.BlogRequest;
import com.web.dto.response.BlogResponse;
import com.web.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public interface BlogService {

    public BlogResponse save(BlogRequest request);

    public BlogResponse update(BlogRequest request);

    public void delete(Long id);

    public BlogResponse findById(Long id);

    public BlogResponse blogPrimary();

    public Page<BlogResponse> findAll(Pageable pageable);


}
