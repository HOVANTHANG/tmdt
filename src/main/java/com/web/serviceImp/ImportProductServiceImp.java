package com.web.serviceImp;

import com.web.entity.ImportProduct;
import com.web.entity.ProductColor;
import com.web.entity.ProductVariant;
import com.web.exception.MessageException;
import com.web.repository.ImportProductRepository;
import com.web.repository.ProductVariantRepository;
import com.web.servive.ImportProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import javax.transaction.Transactional;
import java.sql.Date;
import java.sql.Time;
import java.util.Optional;

@Component
public class ImportProductServiceImp implements ImportProductService {

    @Autowired
    private ImportProductRepository importProductRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Override
    public ImportProduct create(ImportProduct importProduct) {
        if (importProduct.getId() != null) {
            throw new MessageException("id must null");
        }
        Optional<ProductVariant> variant = productVariantRepository.findById(importProduct.getProductVariant().getId());
        if (variant.isEmpty()) {
            throw new MessageException("Không tìm thấy biến thể sản phẩm");
        }
        importProduct.setImportDate(new Date(System.currentTimeMillis()));
        importProduct.setImportTime(new Time(System.currentTimeMillis()));
        ImportProduct result = importProductRepository.save(importProduct);
        variant.get().setQuantity(variant.get().getQuantity() + result.getQuantity());
        productVariantRepository.save(variant.get());
        return result;
    }

    @Override
    @Transactional
    public ImportProduct update(ImportProduct importProduct) {
        if (importProduct.getId() == null) {
            throw new MessageException("id require");
        }
        Optional<ImportProduct> exist = importProductRepository.findById(importProduct.getId());
        if (exist.isEmpty()) {
            throw new MessageException("not found");
        }

        Optional<ProductVariant> variant = productVariantRepository.findById(importProduct.getProductVariant().getId());
        variant.get().setQuantity(
                variant.get().getQuantity() - exist.get().getQuantity());
        importProduct.setImportDate(exist.get().getImportDate());
        importProduct.setImportTime(exist.get().getImportTime());
        ImportProduct result = importProductRepository.save(importProduct);
        variant.get().setQuantity(
                variant.get().getQuantity() + importProduct.getQuantity());
        if (variant.get().getQuantity() < 0) {
            throw new MessageException("Số lượng sau khi update không được nhỏ hơn 0");
        }
        productVariantRepository.save(variant.get());
        return result;
    }

    @Override
    public void delete(Long id) {
        Optional<ImportProduct> exist = importProductRepository.findById(id);
        if (exist.isEmpty()) {
            throw new MessageException("not found");
        }
        ProductVariant variant = exist.get().getProductVariant();

        variant.setQuantity(
                variant.getQuantity() - exist.get().getQuantity());

        if (variant.getQuantity() < 0) {
            throw new MessageException("Quantity < 0");
        }

        productVariantRepository.save(variant);
        importProductRepository.delete(exist.get());
    }

    @Override
    public ImportProduct findById(Long id) {
        Optional<ImportProduct> exist = importProductRepository.findById(id);
        if (exist.isEmpty()) {
            throw new MessageException("not found");
        }
        return exist.get();
    }

    @Override
    public Page<ImportProduct> getAll(Pageable pageable) {
        Page<ImportProduct> page = importProductRepository.findAll(pageable);
        for (ImportProduct p : page.getContent()) {
            if (p.getProductVariant() != null) {
                p.setProductName(p.getProductVariant().getProduct().getName());

                String t1 = p.getProductVariant().getTier1value();
                String t2 = p.getProductVariant().getTier2value();

                p.setVariantName(
                        t2 != null ? t1 + " - " + t2 : t1);
            }
        }
        return page;
    }

    @Override
    public Page<ImportProduct> getByProductAndDate(Long productId, Date from, Date to, Pageable pageable) {
        if (from == null || to == null) {
            from = Date.valueOf("2000-01-01");
            to = Date.valueOf("2200-01-01");
        }
        System.out.println("==== from: " + from);
        System.out.println("==== to: " + to);
        Page<ImportProduct> importProducts = null;
        if (productId == null) {
            importProducts = importProductRepository.findByDate(from, to, pageable);
        } else {
            importProducts = importProductRepository.findByDateAndProduct(from, to, productId, pageable);
        }
        for (ImportProduct p : importProducts.getContent()) {
            if (p.getProductVariant() != null) {
                p.setProductName(p.getProductVariant().getProduct().getName());

                String t1 = p.getProductVariant().getTier1value();
                String t2 = p.getProductVariant().getTier2value();

                p.setVariantName(
                        t2 != null ? t1 + " - " + t2 : t1);
            }
        }
        return importProducts;
    }
}
