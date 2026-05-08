package com.web.api;

import com.web.dto.request.ProductCommentRequest;
import com.web.dto.request.ShopCommentRequest;
import com.web.servive.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/review")
@CrossOrigin
public class ReviewApi {

    private final ReviewService reviewService;

    public ReviewApi(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/user/product")
    public ResponseEntity<?> reviewProduct(@RequestBody ProductCommentRequest request) {
        return ResponseEntity.ok(reviewService.reviewProduct(request));
    }

    @PostMapping("/user/shop")
    public ResponseEntity<?> reviewShop(@RequestBody ShopCommentRequest request) {
        return ResponseEntity.ok(reviewService.reviewShop(request));
    }

    @GetMapping("/public/product")
    public ResponseEntity<?> productReviews(@RequestParam Long productId) {
        return ResponseEntity.ok(reviewService.findProductReviews(productId));
    }

    @GetMapping("/public/shop")
    public ResponseEntity<?> shopReviews(@RequestParam Long shopId) {
        return ResponseEntity.ok(reviewService.findShopReviews(shopId));
    }

    @GetMapping("/user/my-product-review")
    public ResponseEntity<?> myProductReview(@RequestParam Long invoiceDetailId) {
        return ResponseEntity.ok(reviewService.findMyProductReview(invoiceDetailId));
    }

    @GetMapping("/user/my-shop-review")
    public ResponseEntity<?> myShopReview(@RequestParam Long invoiceId,
            @RequestParam Long shopId) {
        return ResponseEntity.ok(reviewService.findMyShopReview(invoiceId, shopId));
    }

    @PutMapping("/user/product/{reviewId}")
    public ResponseEntity<?> updateProductReview(@PathVariable Long reviewId,
            @RequestBody ProductCommentRequest request) {
        return ResponseEntity.ok(reviewService.updateProductReview(reviewId, request));
    }

    @PutMapping("/user/shop/{reviewId}")
    public ResponseEntity<?> updateShopReview(@PathVariable Long reviewId,
            @RequestBody ShopCommentRequest request) {
        return ResponseEntity.ok(reviewService.updateShopReview(reviewId, request));
    }
}