package com.web.serviceImp;

import com.web.entity.ProductColor;
import com.web.repository.ProductColorRepository;
import com.web.servive.ProductColorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class PropductColorServiceImp implements ProductColorService {

    @Autowired
    private ProductColorRepository productColorRepository;

    @Override
    public ProductColor findById(Long id) {
        return productColorRepository.findById(id).get();
    }

    @Override
    public ProductColor update(ProductColor productColor) {
        return productColorRepository.save(productColor);
    }

    @Override
    public List<ProductColor> findByStorage(Long storageId) {
        return productColorRepository.findByStorage(storageId);
    }
}
