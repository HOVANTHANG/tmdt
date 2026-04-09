package com.web.servive;

import com.web.entity.ProductStorage;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ProductStorageService {

    public void delete(Long id);

    public ProductStorage findById(Long id);

    public ProductStorage update(ProductStorage productStorage);

    public List<ProductStorage> findByProduct(Long productId);
}
