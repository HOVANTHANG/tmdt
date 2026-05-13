package com.web.serviceImp;

import com.web.dto.request.ProductCommentRequest;
import com.web.dto.request.ShopCommentRequest;
import com.web.dto.response.ReviewResponse;
import com.web.entity.*;
import com.web.enums.StatusInvoice;
import com.web.exception.MessageException;
import com.web.repository.*;
import com.web.servive.ReviewService;
import com.web.utils.UserUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.sql.Date;
import java.sql.Time;
import java.util.ArrayList;
import java.util.List;

@Service
public class ReviewServiceImp implements ReviewService {

    @Autowired
    private UserUtils userUtils;

    @Autowired
    private ProductCommentRepository productCommentRepository;

    @Autowired
    private ProductCommentImageRepository productCommentImageRepository;

    @Autowired
    private ShopCommentRepository shopCommentRepository;

    @Autowired
    private InvoiceDetailRepository invoiceDetailRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    @Transactional
    public ProductComment reviewProduct(ProductCommentRequest request) {

        User user = userUtils.getUserWithAuthority();

        if (user == null) {
            throw new MessageException("Bạn chưa đăng nhập");
        }

        InvoiceDetail detail = invoiceDetailRepository.findById(request.getInvoiceDetailId())
                .orElseThrow(() -> new MessageException("Không tìm thấy sản phẩm trong đơn hàng"));

        Invoice invoice = detail.getInvoice();

        if (!invoice.getUserAddress().getUser().getId().equals(user.getId())) {
            throw new MessageException("Bạn không có quyền đánh giá sản phẩm này");
        }

        if (!StatusInvoice.DA_NHAN.equals(invoice.getStatusInvoice())) {
            throw new MessageException("Chỉ được đánh giá sau khi đã nhận hàng");
        }

        if (productCommentRepository.existsByUserIdAndInvoiceDetailId(user.getId(), detail.getId())) {
            throw new MessageException("Bạn đã đánh giá sản phẩm này rồi");
        }

        if (request.getStar() == null || request.getStar() < 1 || request.getStar() > 5) {
            throw new MessageException("Số sao phải từ 1 đến 5");
        }

        if (detail.getProductVariant() == null || detail.getProductVariant().getProduct() == null) {
            throw new MessageException("Sản phẩm không hợp lệ");
        }

        ProductComment comment = new ProductComment();

        comment.setUser(user);
        comment.setProduct(detail.getProductVariant().getProduct());
        comment.setInvoiceDetail(detail);
        comment.setStar(request.getStar());
        comment.setContent(request.getContent());
        comment.setCreatedDate(new Date(System.currentTimeMillis()));
        comment.setCreatedTime(new Time(System.currentTimeMillis()));

        ProductComment saved = productCommentRepository.save(comment);
        updateProductReviewScore(
                detail.getProductVariant().getProduct());
        if (request.getImages() != null) {
            for (String img : request.getImages()) {
                if (img == null || img.trim().isEmpty()) {
                    continue;
                }

                ProductCommentImage image = new ProductCommentImage();

                image.setLinkImage(img);
                image.setProductComment(saved);

                productCommentImageRepository.save(image);
            }
        }

        return saved;
    }

    @Override
    @Transactional
    public ShopComment reviewShop(ShopCommentRequest request) {

        User user = userUtils.getUserWithAuthority();

        if (user == null) {
            throw new MessageException("Bạn chưa đăng nhập");
        }

        Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
                .orElseThrow(() -> new MessageException("Không tìm thấy hóa đơn"));

        Shop shop = shopRepository.findById(request.getShopId())
                .orElseThrow(() -> new MessageException("Không tìm thấy shop"));

        if (!invoice.getUserAddress().getUser().getId().equals(user.getId())) {
            throw new MessageException("Bạn không có quyền đánh giá shop này");
        }

        if (!StatusInvoice.DA_NHAN.equals(invoice.getStatusInvoice())) {
            throw new MessageException("Chỉ được đánh giá sau khi đã nhận hàng");
        }

        if (!invoiceDetailRepository.existsByInvoiceIdAndShopId(invoice.getId(), shop.getId())) {
            throw new MessageException("Shop này không thuộc đơn hàng của bạn");
        }

        if (shopCommentRepository.existsByUserIdAndInvoiceIdAndShopId(
                user.getId(),
                invoice.getId(),
                shop.getId())) {

            throw new MessageException("Bạn đã đánh giá shop này rồi");
        }

        if (request.getStar() == null || request.getStar() < 1 || request.getStar() > 5) {
            throw new MessageException("Số sao phải từ 1 đến 5");
        }

        ShopComment comment = new ShopComment();

        comment.setUser(user);
        comment.setInvoice(invoice);
        comment.setShop(shop);
        comment.setStar(request.getStar());
        comment.setContent(request.getContent());
        comment.setCreatedDate(new Date(System.currentTimeMillis()));
        comment.setCreatedTime(new Time(System.currentTimeMillis()));

        ShopComment saved = shopCommentRepository.save(comment);

        updateShopReviewScore(shop);

        return saved;
    }

    @Override
    public List<ReviewResponse> findProductReviews(Long productId) {
        List<ProductComment> comments = productCommentRepository.findByProductIdOrderByIdDesc(productId);

        List<ReviewResponse> responses = new ArrayList<>();

        for (ProductComment c : comments) {
            ReviewResponse response = new ReviewResponse();

            response.setId(c.getId());
            response.setStar(c.getStar());
            response.setContent(c.getContent());
            response.setCreatedDate(c.getCreatedDate());
            response.setCreatedTime(c.getCreatedTime());

            if (c.getUser() != null) {
                response.setUserId(c.getUser().getId());
                response.setUsername(c.getUser().getUsername());
                response.setFullname(c.getUser().getFullname());
            }

            List<String> images = new ArrayList<>();

            if (c.getProductCommentImages() != null) {
                for (ProductCommentImage img : c.getProductCommentImages()) {
                    images.add(img.getLinkImage());
                }
            }

            response.setImages(images);

            responses.add(response);
        }

        return responses;
    }

    @Override
    public List<ReviewResponse> findShopReviews(Long shopId) {
        List<ShopComment> comments = shopCommentRepository.findByShopIdOrderByIdDesc(shopId);

        List<ReviewResponse> responses = new ArrayList<>();

        for (ShopComment c : comments) {
            ReviewResponse response = new ReviewResponse();

            response.setId(c.getId());
            response.setStar(c.getStar());
            response.setContent(c.getContent());
            response.setCreatedDate(c.getCreatedDate());
            response.setCreatedTime(c.getCreatedTime());

            if (c.getUser() != null) {
                response.setUserId(c.getUser().getId());
                response.setUsername(c.getUser().getUsername());
                response.setFullname(c.getUser().getFullname());
            }

            response.setImages(new ArrayList<>());

            responses.add(response);
        }

        return responses;
    }

    @Override
    public ProductComment findMyProductReview(Long invoiceDetailId) {
        User user = userUtils.getUserWithAuthority();

        return productCommentRepository
                .findByUserIdAndInvoiceDetailId(user.getId(), invoiceDetailId)
                .orElse(null);
    }

    @Override
    public ShopComment findMyShopReview(Long invoiceId, Long shopId) {
        User user = userUtils.getUserWithAuthority();

        return shopCommentRepository
                .findByUserIdAndInvoiceIdAndShopId(user.getId(), invoiceId, shopId)
                .orElse(null);
    }

    @Override
    @Transactional
    public ProductComment updateProductReview(Long reviewId, ProductCommentRequest request) {
        User user = userUtils.getUserWithAuthority();

        ProductComment review = productCommentRepository.findById(reviewId)
                .orElseThrow(() -> new MessageException("Không tìm thấy đánh giá"));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new MessageException("Bạn không có quyền sửa đánh giá này");
        }

        if (request.getStar() == null || request.getStar() < 1 || request.getStar() > 5) {
            throw new MessageException("Số sao phải từ 1 đến 5");
        }

        review.setStar(request.getStar());
        review.setContent(request.getContent());
        review.setCreatedDate(new Date(System.currentTimeMillis()));
        review.setCreatedTime(new Time(System.currentTimeMillis()));

        ProductComment saved = productCommentRepository.save(review);

        updateProductReviewScore(review.getProduct());

        return saved;
    }

    @Override
    @Transactional
    public ShopComment updateShopReview(Long reviewId, ShopCommentRequest request) {
        User user = userUtils.getUserWithAuthority();

        ShopComment review = shopCommentRepository.findById(reviewId)
                .orElseThrow(() -> new MessageException("Không tìm thấy đánh giá"));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new MessageException("Bạn không có quyền sửa đánh giá này");
        }

        if (request.getStar() == null || request.getStar() < 1 || request.getStar() > 5) {
            throw new MessageException("Số sao phải từ 1 đến 5");
        }

        review.setStar(request.getStar());
        review.setContent(request.getContent());
        review.setCreatedDate(new Date(System.currentTimeMillis()));
        review.setCreatedTime(new Time(System.currentTimeMillis()));

        ShopComment saved = shopCommentRepository.save(review);

        updateShopReviewScore(review.getShop());

        return saved;
    }

    private void updateProductReviewScore(Product product) {

        List<ProductComment> comments = productCommentRepository.findByProductIdOrderByIdDesc(product.getId());

        double total = 0D;

        for (ProductComment c : comments) {

            if (c.getStar() != null) {
                total += c.getStar();
            }
        }

        product.setReviewCount((long) comments.size());

        if (comments.isEmpty()) {
            product.setAvgStar(0D);
        } else {
            product.setAvgStar(total / comments.size());
        }

        productRepository.save(product);
    }

    private void updateShopReviewScore(Shop shop) {

        List<ShopComment> comments = shopCommentRepository.findByShopIdOrderByIdDesc(shop.getId());

        double total = 0D;

        for (ShopComment c : comments) {

            if (c.getStar() != null) {
                total += c.getStar();
            }
        }

        shop.setReviewCount((long) comments.size());

        if (comments.isEmpty()) {
            shop.setAvgStar(0D);
        } else {
            shop.setAvgStar(total / comments.size());
        }

        shopRepository.save(shop);
    }
}