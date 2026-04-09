package com.web.repository;

import com.web.entity.Category;
import com.web.entity.Province;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProvinceRepository extends JpaRepository<Province,Long> {
}
