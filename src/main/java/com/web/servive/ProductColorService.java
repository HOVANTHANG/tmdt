package com.web.servive;

import com.web.entity.ProductColor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ProductColorService {

    public ProductColor findById(Long id);

    public ProductColor update(ProductColor productColor);

    public List<ProductColor> findByStorage(Long storageId);
}
