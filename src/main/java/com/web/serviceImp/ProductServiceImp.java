package com.web.serviceImp;

import com.web.dto.request.ColorRequest;
import com.web.dto.request.ProductRequest;
import com.web.dto.request.StorageRequest;
import com.web.entity.*;
import com.web.enums.CategoryType;
import com.web.exception.MessageException;
import com.web.mapper.ProductMapper;
import com.web.repository.*;
import com.web.servive.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.Time;
import java.util.Optional;

@Component
@Repository
public class ProductServiceImp implements ProductService {


    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductImageRepository productImageRepository;

    @Autowired
    private ProductColorRepository productColorRepository;

    @Autowired
    private ProductStorageRepository productStorageRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private TradeMarkRepository tradeMarkRepository;

    @Override
    public Product save(ProductRequest productRequest) {
        Product product = productMapper.productRequestToProduct(productRequest);
        Optional<TradeMark> tradeMark = tradeMarkRepository.findById(productRequest.getTradeMarkId());
        Optional<Category> category = categoryRepository.findById(productRequest.getCategoryId());
        if (product.getId() != null) {
            throw new MessageException("id must null");
        }
        if (tradeMark.isEmpty()) {
            throw new MessageException("Không tìm thấy thương hiệu");
        }
        if (tradeMark.isEmpty()) {
            throw new MessageException("Không tìm thấy danh mục");
        }
        product.setCreatedDate(new Date(System.currentTimeMillis()));
        product.setCreatedTime(new Time(System.currentTimeMillis()));
        product.setQuantitySold(0);
        product.setTradeMark(tradeMark.get());
        product.setCategory(category.get());
        Product result = productRepository.save(product);
        for (String link : productRequest.getLinkLinkImages()) {
            ProductImage productImage = new ProductImage();
            productImage.setProduct(result);
            productImage.setLinkImage(link);
            productImageRepository.save(productImage);
        }
        for (StorageRequest storage : productRequest.getStorage()) {
            ProductStorage productStorage = new ProductStorage();
            productStorage.setId(storage.getId());
            productStorage.setProduct(result);
            productStorage.setRam(storage.getRam());
            productStorage.setRom(storage.getRom());
            ProductStorage storagerResult = productStorageRepository.save(productStorage);
            for (ColorRequest color : storage.getColor()) {
                ProductColor productColor = new ProductColor();
                productColor.setProductStorage(storagerResult);
                productColor.setImage(color.getImage());
                productColor.setName(color.getName());
                productColor.setQuantity(color.getQuantity());
                productColor.setPrice(color.getPrice());
                productColorRepository.save(productColor);
            }
        }
        return product;
    }

    @Override
    public Product update(ProductRequest productRequest) {
        Product product = productMapper.productRequestToProduct(productRequest);
        if (product.getId() == null) {
            throw new MessageException("id product require");
        }
        Optional<Product> exist = productRepository.findById(product.getId());
        if (exist.isEmpty()) {
            throw new MessageException("product not found");
        }
        Optional<TradeMark> tradeMark = tradeMarkRepository.findById(productRequest.getTradeMarkId());
        Optional<Category> category = categoryRepository.findById(productRequest.getCategoryId());
        if (tradeMark.isEmpty()) {
            throw new MessageException("Không tìm thấy thương hiệu");
        }
        if (tradeMark.isEmpty()) {
            throw new MessageException("Không tìm thấy danh mục");
        }
        product.setCreatedDate(exist.get().getCreatedDate());
        product.setCreatedTime(exist.get().getCreatedTime());
        product.setQuantitySold(exist.get().getQuantitySold());
        product.setTradeMark(tradeMark.get());
        product.setCategory(category.get());
        Product result = productRepository.save(product);

        for (String link : productRequest.getLinkLinkImages()) {
            ProductImage productImage = new ProductImage();
            productImage.setProduct(result);
            productImage.setLinkImage(link);
            productImageRepository.save(productImage);
        }
        for (StorageRequest storage : productRequest.getStorage()) {
            ProductStorage productStorage = new ProductStorage();
            productStorage.setId(storage.getId());
            productStorage.setProduct(result);
            productStorage.setRam(storage.getRam());
            productStorage.setRom(storage.getRom());
            ProductStorage storagerResult = productStorageRepository.save(productStorage);
            for (ColorRequest color : storage.getColor()) {
                ProductColor productColor = new ProductColor();
                productColor.setProductStorage(storagerResult);
                productColor.setImage(color.getImage());
                productColor.setName(color.getName());
                productColor.setQuantity(color.getQuantity());
                productColor.setPrice(color.getPrice());
                productColorRepository.save(productColor);
            }
        }
        return product;
    }

    @Override
    public void delete(Long idProduct) {
        Product p = productRepository.findById(idProduct).get();
        try {
            productRepository.deleteById(idProduct);
        } catch (Exception e) {
            p.setDeleted(true);
            productRepository.save(p);
        }
    }

    @Override
    public Page<Product> findAll(Pageable pageable) {
        return null;
    }

    @Override
    public Page<Product> search(String param, Pageable pageable) {
        return null;
    }

    @Override
    public Page<Product> searchByAdmin(String param, Long categoryId, Long trademarkId, Pageable pageable) {
        if (param == null) {
            param = "";
        }
        Page<Product> page = null;
        if (categoryId == null && trademarkId == null) {
            page = productRepository.findByParam("%" + param + "%", pageable);
        }
        if (categoryId != null && trademarkId == null) {
            page = productRepository.findByParamAndCate("%" + param + "%", categoryId, pageable);
        }
        if (categoryId == null && trademarkId != null) {
            page = productRepository.findByParamAndTrademark("%" + param + "%", trademarkId, pageable);
        }
        if (categoryId != null && trademarkId != null) {
            page = productRepository.findByParamAndTrademarkAndCate("%" + param + "%", trademarkId, categoryId, pageable);
        }
        return page;
    }


    @Override
    public Product findByIdForAdmin(Long id) {
        Optional<Product> exist = productRepository.findById(id);
        if (exist.isEmpty()) {
            throw new MessageException("product not found");
        }
        return exist.get();
    }

    @Override
    public Page<Product> newProduct(Pageable pageable) {
        Page<Product> page = productRepository.newProduct(pageable);
        return page;
    }

    @Override
    public Page<Product> phuKien(Pageable pageable) {
        Page<Product> page = productRepository.phuKien(CategoryType.PHU_KIEN,pageable);
        return page;
    }


    @Override
    public Page<Product> bestsaler(Pageable pageable) {
        Page<Product> page = productRepository.bestSaler(CategoryType.DIEN_THOAI,pageable);
        return page;
    }

    @Override
    public Page<Product> sanPhamLienQuan(Pageable pageable, Long idTrademark, Long idCategory, Long idproduct) {
        Page<Product> page = null;
        if(idTrademark != null){
            System.out.println("san pham tt 1");
            page = productRepository.sanPhamLienQuan(CategoryType.DIEN_THOAI, idTrademark, idproduct,pageable);
        }
        if(idCategory != null){
            System.out.println("san pham tt 2");
            page = productRepository.sanPhamLienQuanCate(idCategory,idproduct,pageable);
        }
        return page;
    }

    @Override
    public Page<Product> locSanPham(Double smallPrice, Double largePrice, Long idCategory, String trademark, String search, Pageable pageable) {
        if(search == null){
            search = "";
        }
        search = "%"+search+"%";
        Page<Product> page = null;
        if(idCategory == null && trademark == null){
            page = productRepository.locSanPham(search, smallPrice, largePrice, pageable);
        }
        if(idCategory == null && trademark != null){
            page = productRepository.locSanPham(search, smallPrice, largePrice,trademark, pageable);
        }
        if(idCategory != null && trademark == null){
            page = productRepository.locSanPham(search, smallPrice, largePrice,idCategory, pageable);
        }
        if(idCategory != null && trademark != null){
            page = productRepository.locSanPham(search, smallPrice, largePrice,trademark, idCategory, pageable);
        }
        return page;
    }

}
