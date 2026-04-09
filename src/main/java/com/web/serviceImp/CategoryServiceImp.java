package com.web.serviceImp;

import com.web.entity.Category;
import com.web.enums.CategoryType;
import com.web.exception.MessageException;
import com.web.repository.CategoryRepository;
import com.web.servive.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class CategoryServiceImp implements CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public List<Category> findAllList() {
        return categoryRepository.findAll();
    }

    @Override
    public Category save(Category category) {
        if(categoryRepository.findByName(category.getName()).isPresent()){
            throw new MessageException("Tên danh mục đã tồn tại");
        }
        Category result = categoryRepository.save(category);
        return result;
    }

    @Override
    public Category update(Category category) {
        if(categoryRepository.findByNameAndId(category.getName(), category.getId()).isPresent()){
            throw new MessageException("Tên danh mục đã tồn tại", 400);
        }
        Category result = categoryRepository.save(category);
        return result;
    }

    @Override
    public void delete(Long categoryId) {
        categoryRepository.deleteById(categoryId);
    }

    @Override
    public Category findById(Long id) {
        Optional<Category> category = categoryRepository.findById(id);
        if(category.isEmpty()){
            throw new MessageException("Not found category :"+id);
        }
        return category.get();
    }

    @Override
    public Page<Category> findAll(Pageable pageable) {
        Page<Category> categories = categoryRepository.findAll(pageable);
        return categories;
    }

    @Override
    public Page<Category> search(String param, Pageable pageable) {
        Page<Category> categories = categoryRepository.findByParam("%"+param+"%",pageable);
        return categories;
    }

    @Override
    public List<Category> findByType(CategoryType categoryType) {
        return categoryRepository.findByType(categoryType);
    }
}
