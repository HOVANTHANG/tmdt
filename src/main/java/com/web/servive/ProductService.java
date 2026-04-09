package com.web.servive;

import com.web.dto.request.ProductRequest;
import com.web.dto.response.ProductResponse;
import com.web.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public interface ProductService {

    public Product save(ProductRequest productRequest);

    public Product update(ProductRequest productRequest);

    public void delete(Long idProduct);

    public Page<Product> findAll(Pageable pageable);


    public Page<Product> search(String param, Pageable pageable);

    public Page<Product> searchByAdmin(String param, Long categoryId, Long trademarkId, Pageable pageable);


    public Product findByIdForAdmin(Long id);

    public Page<Product> newProduct(Pageable pageable);


    public Page<Product> phuKien(Pageable pageable);

    public Page<Product> bestsaler(Pageable pageable);

    public Page<Product> sanPhamLienQuan(Pageable pageable, Long idTrademark, Long idCategory, Long idproduct);

    public Page<Product> locSanPham(Double smallPrice, Double largePrice, Long idCategory, String trademark, String search, Pageable pageable);

}

