package com.web.serviceImp;

import com.web.entity.Banner;
import com.web.repository.BannerRepository;
import com.web.servive.BannerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class BannerServiceImp implements BannerService {

    @Autowired
    private BannerRepository bannerRepository;

    @Override
    public Banner save(Banner banner) {
        return bannerRepository.save(banner);
    }

    @Override
    public Banner update(Banner banner) {
        return bannerRepository.save(banner);
    }

    @Override
    public void delete(Long id) {
        bannerRepository.deleteById(id);
    }

    @Override
    public Banner findById(Long id) {
        return bannerRepository.findById(id).get();
    }

    @Override
    public List<Banner> findByPageName(String pageName) {
        return bannerRepository.findByPageName("%"+pageName+"%");
    }

    @Override
    public Page<Banner> search(String param, Pageable pageable) {
        return bannerRepository.search("%"+param+"%", pageable);
    }
}
