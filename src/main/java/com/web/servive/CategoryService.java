package com.web.servive;

import com.web.entity.Category;
import com.web.enums.CategoryType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface CategoryService {

    public List<Category> findAllList();

    public Category save(Category category);

    public Category update(Category category);

    public void delete(Long categoryId);

    public Category findById(Long id);

    public Page<Category> findAll(Pageable pageable);

    public Page<Category> search(String param, Pageable pageable);

    public List<Category> findByType(CategoryType categoryType);

}
