package com.web.servive;

import com.web.dto.request.ProductCommentRequest;
import com.web.dto.request.ShopCommentRequest;
import com.web.dto.response.ReviewResponse;
import com.web.entity.ProductComment;
import com.web.entity.ShopComment;

import java.util.List;

public interface ReviewService {

    ProductComment reviewProduct(ProductCommentRequest request);

    ShopComment reviewShop(ShopCommentRequest request);

    List<ReviewResponse> findProductReviews(Long productId);

    List<ReviewResponse> findShopReviews(Long shopId);

    ProductComment findMyProductReview(Long invoiceDetailId);

    ShopComment findMyShopReview(Long invoiceId, Long shopId);

    ProductComment updateProductReview(Long reviewId, ProductCommentRequest request);

    ShopComment updateShopReview(Long reviewId, ShopCommentRequest request);
}