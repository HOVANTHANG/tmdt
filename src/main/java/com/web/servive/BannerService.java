package com.web.servive;

import com.web.dto.request.BlogRequest;
import com.web.dto.response.BlogResponse;
import com.web.entity.Banner;
import com.web.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface BannerService {

    public Banner save(Banner banner);

    public Banner update(Banner banner);

    public void delete(Long id);

    public Banner findById(Long id);

    public List<Banner> findByPageName(String pageName);

    public Page<Banner> search(String param, Pageable pageable);
}
