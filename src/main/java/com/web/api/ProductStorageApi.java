package com.web.api;

import com.web.entity.ProductStorage;
import com.web.servive.ProductStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/product-storage")
@CrossOrigin
public class ProductStorageApi {

    @Autowired
    private ProductStorageService productStorageService;

    @DeleteMapping("/admin/delete")
    public ResponseEntity<?> delete(@RequestParam("id") Long id){
        productStorageService.delete(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/public/find-by-id")
    public ResponseEntity<?> findById(@RequestParam("id") Long id){
        ProductStorage result = productStorageService.findById(id);
        return new ResponseEntity<>(result,HttpStatus.OK);
    }

    @PostMapping("/admin/update")
    public ResponseEntity<?> update( @RequestBody ProductStorage productStorage){
        ProductStorage result = productStorageService.update(productStorage);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @GetMapping("/public/find-by-product")
    public ResponseEntity<?> findByProductId(@RequestParam("id") Long productId){
        List<ProductStorage> result = productStorageService.findByProduct(productId);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }
}
