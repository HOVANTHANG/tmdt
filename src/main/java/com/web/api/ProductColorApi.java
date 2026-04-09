package com.web.api;

import com.web.entity.ProductColor;
import com.web.entity.ProductStorage;
import com.web.repository.ProductColorRepository;
import com.web.servive.ProductColorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product-color")
@CrossOrigin
public class ProductColorApi {

    @Autowired
    private ProductColorRepository productColorRepository;

    @Autowired
    private ProductColorService productColorService;

    @DeleteMapping("/admin/delete")
    public ResponseEntity<?> delete(@RequestParam("id") Long id){
        productColorRepository.deleteById(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/public/find-by-id")
    public ResponseEntity<?> findById(@RequestParam("id") Long id){
        ProductColor result = productColorService.findById(id);
        return new ResponseEntity<>(result,HttpStatus.OK);
    }

    @PostMapping("/admin/update")
    public ResponseEntity<?> update( @RequestBody ProductColor productColor){
        ProductColor result = productColorService.update(productColor);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @GetMapping("/public/find-by-storage")
    public ResponseEntity<?> findByStorage( @RequestParam("id") Long id){
        List<ProductColor> result = productColorService.findByStorage(id);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }
}
