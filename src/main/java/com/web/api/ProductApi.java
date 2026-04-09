package com.web.api;

import com.web.dto.request.ProductRequest;
import com.web.dto.response.ProductResponse;
import com.web.entity.Product;
import com.web.mapper.ProductMapper;
import com.web.repository.ProductRepository;
import com.web.servive.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/product")
@CrossOrigin
public class ProductApi {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductMapper productMapper;

    @PostMapping("/admin/create")
    public ResponseEntity<?> save(@RequestBody ProductRequest productRequest) {
        Product response = productService.save(productRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/admin/update")
    public ResponseEntity<?> update(@RequestBody ProductRequest productRequest) {
        Product response = productService.update(productRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/admin/findById")
    public ResponseEntity<?> findByIdForAdmin(@RequestParam("id") Long id) {
        Product response = productService.findByIdForAdmin(id);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/public/findById")
    public ResponseEntity<?> findByIdForUser(@RequestParam("id") Long id) {
        Product response = productService.findByIdForAdmin(id);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/public/find-all-by-admin")
    public ResponseEntity<?> findByAdmin(@RequestParam(value = "category", required = false) Long category,
                                         @RequestParam(value = "trademark", required = false) Long trademark,
                                         @RequestParam(value = "search", required = false) String search, Pageable pageable) {
        Page<Product> response = productService.searchByAdmin(search, category, trademark, pageable);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @DeleteMapping("/admin/delete")
    public ResponseEntity<?> delete(@RequestParam("id") Long id) {
        productService.delete(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/public/new-product")
    public ResponseEntity<?> findByAdmin(Pageable pageable) {
        Page<Product> response = productService.newProduct(pageable);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/public/phu-kien")
    public ResponseEntity<?> phuKien(Pageable pageable) {
        Page<Product> response = productService.phuKien(pageable);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/public/best-saler")
    public ResponseEntity<?> bestSaler(Pageable pageable) {
        Page<Product> response = productService.bestsaler(pageable);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/public/san-pham-lienquan")
    public ResponseEntity<?> sanPhamLienQuan(@RequestParam("id") Long idproduct,
                                             @RequestParam(value = "idtrademark", required = false) Long idtrademark,
                                             @RequestParam(value = "idcategory", required = false) Long idcategory, Pageable pageable) {
        Page<Product> response = productService.sanPhamLienQuan(pageable, idtrademark, idcategory, idproduct);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/public/loc-san-pham")
    public ResponseEntity<?> locSanPham(@RequestParam(value = "trademark", required = false) String trademark,
                                        @RequestParam(value = "search", required = false) String search,
                                        @RequestParam(value = "idcategory", required = false) Long idcategory,
                                        @RequestParam(value = "small", required = false) Double small,
                                        @RequestParam(value = "large", required = false) Double large,
                                        Pageable pageable) {
        Page<Product> response = productService.locSanPham(small, large,idcategory, trademark, search, pageable);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/public/findAll-list")
    public ResponseEntity<?> findAllList(){
        List<Product> list = productRepository.findAll();
        return new ResponseEntity<>(list, HttpStatus.OK);
    }
}
