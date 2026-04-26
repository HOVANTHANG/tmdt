package com.web.serviceImp;

import com.web.dto.request.ColorRequest;
import com.web.dto.request.ProductRequest;
import com.web.dto.request.StorageRequest;
import com.web.dto.request.VariantRequest;
import com.web.entity.*;
import com.web.enums.CategoryType;
import com.web.exception.MessageException;
import com.web.mapper.ProductMapper;
import com.web.repository.*;
import com.web.servive.ProductService;
import com.web.utils.UserUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

import java.sql.Date;
import java.sql.Time;

@Component
@Repository
public class ProductServiceImp implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductImageRepository productImageRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private TradeMarkRepository tradeMarkRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private UserUtils userUtils;

    @Autowired
    private InvoiceDetailRepository invoiceDetailRepository;

    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private ImportProductRepository importProductRepository;

    private Shop resolveShop(ProductRequest request) {
        User currentUser = userUtils.getUserWithAuthority();

        if (currentUser == null) {
            throw new MessageException("Bạn chưa đăng nhập");
        }

        String role = currentUser.getAuthorities().getName();

        if ("ROLE_ADMIN".equals(role)) {
            if (request.getShopId() == null) {
                return null;
            }
            return shopRepository.findById(request.getShopId())
                    .orElseThrow(() -> new MessageException("Shop không tồn tại"));
        }

        if ("ROLE_SELLER".equals(role)) {
            if (currentUser.getShop() == null) {
                throw new MessageException("Tài khoản seller chưa có shop");
            }
            return currentUser.getShop();
        }

        throw new MessageException("Bạn không có quyền thao tác sản phẩm");
    }

    @Override
    public Product save(ProductRequest productRequest) {

        Product product = productMapper.productRequestToProduct(productRequest);

        Optional<TradeMark> tradeMark = tradeMarkRepository.findById(productRequest.getTradeMarkId());
        Optional<Category> category = categoryRepository.findById(productRequest.getCategoryId());

        if (tradeMark.isEmpty()) {
            throw new MessageException("Không tìm thấy thương hiệu");
        }

        if (category.isEmpty()) {
            throw new MessageException("Không tìm thấy danh mục");
        }
        Shop shop = resolveShop(productRequest);

        product.setCreatedDate(new Date(System.currentTimeMillis()));
        product.setCreatedTime(new Time(System.currentTimeMillis()));
        product.setQuantitySold(0);
        product.setTradeMark(tradeMark.get());
        product.setCategory(category.get());
        product.setShop(shop);

        Product savedProduct = productRepository.save(product);

        // lưu ảnh
        for (String link : productRequest.getLinkLinkImages()) {
            ProductImage img = new ProductImage();
            img.setProduct(savedProduct);
            img.setLinkImage(link);
            productImageRepository.save(img);
        }

        // 🔥 lưu variant
        for (VariantRequest v : productRequest.getVariants()) {
            ProductVariant variant = new ProductVariant();
            variant.setTier1name(v.getTier1name());
            variant.setTier1value(v.getTier1value());
            variant.setTier2name(v.getTier2name());
            variant.setTier2value(v.getTier2value());
            variant.setPrice(v.getPrice());
            variant.setQuantity(v.getQuantity());
            variant.setImage(v.getImage());
            variant.setProduct(savedProduct);

            productVariantRepository.save(variant);
        }

        return savedProduct;
    }

    @Override
    public Product update(ProductRequest productRequest) {
        if (productRequest.getId() == null) {
            throw new MessageException("id product require");
        }

        Product exist = productRepository.findById(productRequest.getId())
                .orElseThrow(() -> new MessageException("product not found"));

        Optional<TradeMark> tradeMark = tradeMarkRepository.findById(productRequest.getTradeMarkId());
        Optional<Category> category = categoryRepository.findById(productRequest.getCategoryId());

        if (tradeMark.isEmpty()) {
            throw new MessageException("Không tìm thấy thương hiệu");
        }

        if (category.isEmpty()) {
            throw new MessageException("Không tìm thấy danh mục");
        }
        Shop shop = resolveShop(productRequest);

        // update info
        exist.setCode(productRequest.getCode());
        exist.setName(productRequest.getName());
        exist.setDescription(productRequest.getDescription());
        exist.setImageBanner(productRequest.getImageBanner());
        exist.setPrice(productRequest.getPrice());
        exist.setOldPrice(productRequest.getOldPrice());
        exist.setTradeMark(tradeMark.get());
        exist.setCategory(category.get());
        exist.setShop(shop);

        Product savedProduct = productRepository.save(exist);

        // ❗ XÓA variant cũ
        productVariantRepository.deleteByProductId(savedProduct.getId());

        // 🔥 thêm variant mới
        for (VariantRequest v : productRequest.getVariants()) {
            ProductVariant variant = new ProductVariant();
            variant.setTier1name(v.getTier1name());
            variant.setTier1value(v.getTier1value());
            variant.setTier2name(v.getTier2name());
            variant.setTier2value(v.getTier2value());
            variant.setPrice(v.getPrice());
            variant.setQuantity(v.getQuantity());
            variant.setImage(v.getImage());
            variant.setProduct(savedProduct);

            productVariantRepository.save(variant);
        }

        return savedProduct;
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
        if (param == null || param.trim().isEmpty()) {
            param = "";
        } else {
            param = param.trim();
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
            page = productRepository.findByParamAndTrademarkAndCate("%" + param + "%", trademarkId, categoryId,
                    pageable);
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

    // @Override
    // public Page<Product> phuKien(Pageable pageable) {
    // Page<Product> page = productRepository.findByCategoryId(categoryId,
    // pageable);
    // return page;
    // }

    @Override
    public Page<Product> bestsaler(Pageable pageable) {
        Page<Product> page = productRepository.bestSalerByCategory(CategoryType.DIEN_TU, pageable);
        return page;
    }

    @Override
    public Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new MessageException("Không tìm thấy sản phẩm"));
    }

    @Override
    public Page<Product> sanPhamLienQuan(Pageable pageable, Long idTrademark, Long idCategory, Long idproduct) {
        Page<Product> page = null;

        if (idTrademark != null) {
            page = productRepository.sanPhamLienQuanByTrademark(idTrademark, idproduct, pageable);
        }

        if (idCategory != null) {
            page = productRepository.sanPhamLienQuanCate(idCategory, idproduct, pageable);
        }

        if (page == null) {
            throw new MessageException("Không tìm thấy tiêu chí sản phẩm liên quan");
        }

        return page;
    }

    @Override
    public Page<Product> locSanPham(Double smallPrice, Double largePrice, Long idCategory, String trademark,
            String search, Pageable pageable) {
        if (search == null) {
            search = "";
        }
        search = "%" + search + "%";
        Page<Product> page = null;
        if (idCategory == null && trademark == null) {
            page = productRepository.locSanPham(search, smallPrice, largePrice, pageable);
        }
        if (idCategory == null && trademark != null) {
            page = productRepository.locSanPham(search, smallPrice, largePrice, trademark, pageable);
        }
        if (idCategory != null && trademark == null) {
            page = productRepository.locSanPham(search, smallPrice, largePrice, idCategory, pageable);
        }
        if (idCategory != null && trademark != null) {
            page = productRepository.locSanPham(search, smallPrice, largePrice, trademark, idCategory, pageable);
        }
        return page;
    }

    @Override
    public Page<Product> findByMyShop(String search, Long categoryId, Long trademarkId, Pageable pageable) {
        User currentUser = userUtils.getUserWithAuthority();

        if (currentUser.getShop() == null) {
            throw new MessageException("Tài khoản seller chưa có shop");
        }

        Long shopId = currentUser.getShop().getId();

        if (search == null) {
            search = "";
        }
        search = "%" + search + "%";

        if (categoryId == null && trademarkId == null) {
            return productRepository.findByShop(shopId, search, pageable);
        }
        if (categoryId != null && trademarkId == null) {
            return productRepository.findByShopAndCategory(shopId, search, categoryId, pageable);
        }
        if (categoryId == null && trademarkId != null) {
            return productRepository.findByShopAndTrademark(shopId, search, trademarkId, pageable);
        }
        return productRepository.findByShopAndCategoryAndTrademark(shopId, search, categoryId, trademarkId, pageable);
    }

}
