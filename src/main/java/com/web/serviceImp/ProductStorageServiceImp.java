package com.web.serviceImp;

import com.web.entity.ProductStorage;
import com.web.repository.ProductStorageRepository;
import com.web.servive.ProductStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ProductStorageServiceImp implements ProductStorageService {

    @Autowired
    private ProductStorageRepository productStorageRepository;

    @Override
    public void delete(Long id) {
        productStorageRepository.deleteById(id);
    }

    @Override
    public ProductStorage findById(Long id) {
        return productStorageRepository.findById(id).get();
    }

    @Override
    public ProductStorage update(ProductStorage productStorage) {
        ProductStorage p = productStorageRepository.findById(productStorage.getId()).get();
        productStorage.setProduct(p.getProduct());
        return productStorageRepository.save(productStorage);
    }

    @Override
    public List<ProductStorage> findByProduct(Long productId) {
        return productStorageRepository.findByProduct(productId);
    }
}
