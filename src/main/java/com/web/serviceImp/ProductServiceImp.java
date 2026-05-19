package com.web.serviceImp;

import com.web.dto.request.ColorRequest;
import com.web.dto.request.ProductRequest;
import com.web.dto.request.StorageRequest;
import com.web.dto.request.VariantRequest;
import com.web.dto.response.ProductShopResponse;
import com.web.dto.response.ShopResponse;
import com.web.entity.*;
import com.web.enums.CategoryType;
import com.web.enums.ProductStatus;
import com.web.exception.MessageException;
import com.web.mapper.ProductMapper;
import com.web.repository.*;
import com.web.servive.ProductService;
import com.web.utils.UserUtils;
import org.springframework.data.domain.PageImpl;

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

        Optional<Category> category = categoryRepository.findById(productRequest.getCategoryId());

        if (category.isEmpty()) {
            throw new MessageException("Không tìm thấy danh mục");
        }
        Shop shop = resolveShop(productRequest);

        // Thương hiệu là tùy chọn — không bắt buộc
        TradeMark tradeMark = null;
        if (productRequest.getTradeMarkId() != null) {
            tradeMark = tradeMarkRepository.findById(productRequest.getTradeMarkId()).orElse(null);
        }

        product.setCreatedDate(new Date(System.currentTimeMillis()));
        product.setCreatedTime(new Time(System.currentTimeMillis()));
        product.setQuantitySold(0);
        product.setTradeMark(tradeMark);
        product.setCategory(category.get());
        product.setShop(shop);

        // Nếu admin tạo → APPROVED ngay; nếu seller tạo → PENDING chờ duyệt
        String role = userUtils.getUserWithAuthority().getAuthorities().getName();
        if ("ROLE_ADMIN".equals(role)) {
            product.setStatus(ProductStatus.APPROVED);
        } else {
            product.setStatus(ProductStatus.PENDING);
        }

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
            variant.setImportPrice(v.getImportPrice());
            variant.setQuantity(v.getQuantity());
            variant.setImage(v.getImage());
            variant.setProduct(savedProduct);

            productVariantRepository.save(variant);
        }

        return savedProduct;
    }

    @Override
    @Transactional
    public Product update(ProductRequest productRequest) {
        if (productRequest.getId() == null) {
            throw new MessageException("id product require");
        }

        Product exist = productRepository.findById(productRequest.getId())
                .orElseThrow(() -> new MessageException("product not found"));

        Category category = categoryRepository.findById(productRequest.getCategoryId())
                .orElseThrow(() -> new MessageException("Không tìm thấy danh mục"));

        Shop shop = resolveShop(productRequest);

        // Thương hiệu là tùy chọn — không bắt buộc
        TradeMark tradeMark = null;
        if (productRequest.getTradeMarkId() != null) {
            tradeMark = tradeMarkRepository.findById(productRequest.getTradeMarkId()).orElse(null);
        }

        exist.setCode(productRequest.getCode());
        exist.setName(productRequest.getName());
        exist.setDescription(productRequest.getDescription());
        exist.setImageBanner(productRequest.getImageBanner());
        exist.setPrice(productRequest.getPrice());
        exist.setOldPrice(productRequest.getOldPrice());
        exist.setTradeMark(tradeMark);
        exist.setCategory(category);
        exist.setShop(shop);

        Product savedProduct = productRepository.save(exist);

        List<ProductVariant> oldVariants = productVariantRepository.findByProductId(savedProduct.getId());

        Map<Long, ProductVariant> oldMap = oldVariants.stream()
                .filter(v -> v.getId() != null)
                .collect(Collectors.toMap(ProductVariant::getId, v -> v));

        Set<Long> requestIds = new HashSet<>();

        if (productRequest.getVariants() != null) {
            for (VariantRequest v : productRequest.getVariants()) {
                ProductVariant variant;

                if (v.getId() != null && oldMap.containsKey(v.getId())) {
                    variant = oldMap.get(v.getId());
                    requestIds.add(v.getId());
                } else {
                    variant = new ProductVariant();
                    variant.setProduct(savedProduct);
                }

                variant.setTier1name(v.getTier1name());
                variant.setTier1value(v.getTier1value());
                variant.setTier2name(v.getTier2name());
                variant.setTier2value(v.getTier2value());
                variant.setPrice(v.getPrice());
                variant.setImportPrice(v.getImportPrice());
                variant.setQuantity(v.getQuantity());
                variant.setImage(v.getImage());

                productVariantRepository.save(variant);
            }
        }

        for (ProductVariant old : oldVariants) {
            if (old.getId() != null && !requestIds.contains(old.getId())) {
                boolean usedInInvoice = invoiceDetailRepository.existsByProductVariantId(old.getId());

                if (!usedInInvoice) {
                    productVariantRepository.delete(old);
                }
            }
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

    @Override
    public Page<ProductShopResponse> findByShop(Long shopId, Pageable pageable) {

        if (shopId == null) {
            throw new MessageException("shopId không được để trống");
        }

        Page<Product> page = productRepository.findByShopIdAndDeletedFalse(shopId, pageable);

        long totalProduct = page.getTotalElements();

        return page.map(p -> {
            ProductShopResponse dto = new ProductShopResponse();

            dto.setId(p.getId());
            dto.setCode(p.getCode());
            dto.setName(p.getName());
            dto.setImageBanner(p.getImageBanner());
            dto.setPrice(p.getPrice());
            dto.setOldPrice(p.getOldPrice());

            if (p.getShop() != null) {
                ShopResponse shop = new ShopResponse();

                shop.setId(p.getShop().getId());
                shop.setShopName(p.getShop().getShopName());
                shop.setAvatar(p.getShop().getAvatar()); // nếu có
                shop.setTotalProduct(totalProduct);

                dto.setShop(shop);
            }

            return dto;
        });
    }

    @Override
    public Page<ProductShopResponse> findByCategory(Long categoryId, Pageable pageable) {
        if (categoryId == null) {
            throw new MessageException("categoryId không được để trống");
        }

        // 1. Lấy dữ liệu đã được sắp xếp theo độ ưu tiên từ DB
        Page<Product> page = productRepository.findByCategoryIdIncludingChildren(categoryId, pageable);
        List<Product> originalList = page.getContent();

        // 2. Áp dụng thuật toán trộn/xen kẽ để phân tán các sản phẩm trùng Shop
        List<Product> diversifiedList = diversifyShops(originalList);

        // 3. Map danh sách đã phân tán sang DTO
        List<ProductShopResponse> dtoList = diversifiedList.stream().map(p -> {
            ProductShopResponse dto = new ProductShopResponse();
            dto.setId(p.getId());
            dto.setCode(p.getCode());
            dto.setName(p.getName());
            dto.setImageBanner(p.getImageBanner());
            dto.setPrice(p.getPrice());
            dto.setOldPrice(p.getOldPrice());

            if (p.getShop() != null) {
                ShopResponse shop = new ShopResponse();
                shop.setId(p.getShop().getId());
                shop.setShopName(p.getShop().getShopName());
                shop.setAvatar(p.getShop().getAvatar());
                dto.setShop(shop);
            }
            return dto;
        }).toList();

        // 4. Trả về đối tượng PageImpl mới với danh sách DTO đã được sắp xếp lại
        return new PageImpl<>(dtoList, pageable, page.getTotalElements());
    }

    @Override
    public Page<Product> searchMarketplace(String keyword, Pageable pageable) {
        if (keyword == null) {
            keyword = "";
        }

        // 1. Lấy dữ liệu tìm kiếm gốc
        Page<Product> page = productRepository.searchMarketplace(keyword, pageable);
        List<Product> originalList = page.getContent();

        // 2. Áp dụng thuật toán trộn/xen kẽ sản phẩm
        List<Product> diversifiedList = diversifyShops(originalList);

        // 3. Trả về PageImpl mới chứa danh sách thực thể Product đã phân tán
        return new PageImpl<>(diversifiedList, pageable, page.getTotalElements());
    }

    /**
     * Thuật toán xen kẽ (Interleaving) sản phẩm của các Shop khác nhau.
     * Giữ nguyên thứ tự ưu tiên tối đa nhưng không để các sản phẩm của cùng 1 Shop
     * đứng cạnh nhau liên tiếp.
     */
    private List<Product> diversifyShops(List<Product> originalList) {
        if (originalList == null || originalList.isEmpty()) {
            return new ArrayList<>();
        }

        List<Product> result = new ArrayList<>();
        // Sử dụng LinkedHashMap để giữ nguyên thứ tự xuất hiện đầu tiên của các Shop
        // (đảm bảo tính công bằng theo điểm số)
        Map<Long, Queue<Product>> shopProductsMap = new LinkedHashMap<>();

        // Gom sản phẩm vào các hàng đợi (Queue) riêng biệt theo từng Shop ID
        for (Product p : originalList) {
            Long shopId = (p.getShop() != null) ? p.getShop().getId() : -1L; // Đề phòng sản phẩm không có shop
            shopProductsMap.computeIfAbsent(shopId, k -> new LinkedList<>()).add(p);
        }

        // Lấy xen kẽ tuần tự 1 sản phẩm từ mỗi Shop ra đưa vào danh sách kết quả
        boolean hasMoreProducts = true;
        while (hasMoreProducts) {
            hasMoreProducts = false;
            for (Queue<Product> queue : shopProductsMap.values()) {
                if (!queue.isEmpty()) {
                    result.add(queue.poll());
                    hasMoreProducts = true; // Xác nhận vẫn còn sản phẩm để tiếp tục vòng lặp
                }
            }
        }

        return result;
    }
}
