package com.web.repository;

import com.web.entity.Authority;
import com.web.entity.Category;
import com.web.enums.CategoryType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category,Long> {

    @Query("select c from Category c where c.name = ?1")
    public Optional<Category> findByName(String name);

    @Query("select c from Category c where c.name = ?1 and c.id <> ?2")
    public Optional<Category> findByNameAndId(String name, Long id);

    @Query("select c from Category c where c.name like ?1")
    public Page<Category> findByParam(String param, Pageable pageable);


    @Query("select c from Category c where c.categoryType = ?1")
    public List<Category> findByType(CategoryType categoryType);

}
