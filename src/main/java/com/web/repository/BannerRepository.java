package com.web.repository;

import com.web.entity.Banner;
import com.web.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BannerRepository extends JpaRepository<Banner,Long> {

    @Query("select b from Banner b where b.pageName like ?1 or b.pageName = 'ALL'")
    List<Banner> findByPageName(String name);

    @Query("select b from Banner b where b.pageName like ?1")
    Page<Banner> search(String search, Pageable pageable);
}
