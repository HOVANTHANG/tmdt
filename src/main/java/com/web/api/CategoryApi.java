package com.web.api;

import com.web.entity.Category;
import com.web.enums.CategoryType;
import com.web.servive.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/category")
@CrossOrigin
public class CategoryApi {

    @Autowired
    private CategoryService categoryService;

    @GetMapping("/public/findAll")
    public ResponseEntity<?> findAll() {
        List<Category> categories = categoryService.findAllList();
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }

    @GetMapping("/public/search")
    public ResponseEntity<?> search(@RequestParam("q") String search, Pageable pageable) {
        Page<Category> categories = categoryService.search(search, pageable);
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }

    @GetMapping("/public/find-by-type")
    public ResponseEntity<?> findByType(@RequestParam(value = "type") CategoryType categoryType) {
        List<Category> categories = categoryService.findByType(categoryType);
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }

    @GetMapping("/public/get-all-category-type")
    public ResponseEntity<?> getAllType() {
        List<CategoryType> type = Arrays.stream(CategoryType.class.getEnumConstants()).toList();
        return new ResponseEntity<>(type, HttpStatus.OK);
    }

    @GetMapping("/public/root")
    public ResponseEntity<?> findRootCategories() {
        List<Category> roots = categoryService.findRootCategories();
        return new ResponseEntity<>(roots, HttpStatus.OK);
    }

    @GetMapping("/public/children")
    public ResponseEntity<?> findChildren(@RequestParam("parentId") Long parentId) {
        List<Category> children = categoryService.findByParentId(parentId);
        return new ResponseEntity<>(children, HttpStatus.OK);
    }

    @PostMapping("/admin/create")
    public ResponseEntity<?> save(@RequestBody Category category) {
        Category result = categoryService.save(category);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @PostMapping("/admin/update")
    public ResponseEntity<?> update(@RequestBody Category category) {
        Category result = categoryService.update(category);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @DeleteMapping("/admin/delete")
    public ResponseEntity<?> delete(@RequestParam("id") Long id) {
        categoryService.delete(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/admin/findById")
    public ResponseEntity<?> findById(@RequestParam("id") Long id) {
        Category result = categoryService.findById(id);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @PostMapping("/seller/create")
    public ResponseEntity<?> save1(@RequestBody Category category) {
        Category result = categoryService.save(category);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @PostMapping("/seller/update")
    public ResponseEntity<?> update1(@RequestBody Category category) {
        Category result = categoryService.update(category);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @DeleteMapping("/seller/delete")
    public ResponseEntity<?> delete1(@RequestParam("id") Long id) {
        categoryService.delete(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/seller/findById")
    public ResponseEntity<?> findById1(@RequestParam("id") Long id) {
        Category result = categoryService.findById(id);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

}
