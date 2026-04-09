package com.web.servive;

import com.web.entity.ImportProduct;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.sql.Date;

@Service
public interface ImportProductService {

    public ImportProduct create(ImportProduct importProduct);

    public ImportProduct update(ImportProduct importProduct);

    public void delete(Long id);

    public ImportProduct findById(Long id);

    public Page<ImportProduct> getAll(Pageable pageable);

    public Page<ImportProduct> getByProductAndDate(Long productId, Date from, Date to, Pageable pageable);

}
