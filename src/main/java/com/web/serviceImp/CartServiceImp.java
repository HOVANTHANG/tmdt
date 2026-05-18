package com.web.serviceImp;

import com.web.dto.response.CartResponse;
import com.web.entity.Cart;
import com.web.entity.ProductVariant;
import com.web.repository.ProductVariantRepository;
import com.web.entity.User;
import com.web.exception.MessageException;
import com.web.repository.CartRepository;

import com.web.servive.CartService;
import com.web.utils.UserUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class CartServiceImp implements CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserUtils userUtils;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Override
    public void addCart(Long productVariantId, int quantity) {
        User user = userUtils.getUserWithAuthority();

        if (quantity < 1) quantity = 1;

        ProductVariant productVariant = productVariantRepository.findById(productVariantId)
                .orElseThrow(() -> new MessageException("Không tìm thấy biến thể sản phẩm"));

        Optional<Cart> existing = cartRepository.findByVariantAndUser(user.getId(), productVariantId);
        if (existing.isPresent()) {
            Cart cart = existing.get();
            int newQty = cart.getQuantity() + quantity;
            if (newQty > productVariant.getQuantity()) {
                throw new MessageException("Số lượng trong kho không đủ (còn " + productVariant.getQuantity() + ")");
            }
            cart.setQuantity(newQty);
            cartRepository.save(cart);
            return;
        }

        if (quantity > productVariant.getQuantity()) {
            throw new MessageException("Số lượng trong kho không đủ (còn " + productVariant.getQuantity() + ")");
        }

        Cart cart = new Cart();
        cart.setUser(user);
        cart.setQuantity(quantity);
        cart.setProductVariant(productVariant);

        cartRepository.save(cart);
    }

    @Override
    public void remove(Long id) {
        cartRepository.deleteById(id);
    }

    @Override
    public List<CartResponse> findByUser() {
        List<Cart> list = cartRepository.findByUser(userUtils.getUserWithAuthority().getId());
        List<CartResponse> responses = new ArrayList<>();

        for (Cart c : list) {
            CartResponse cartResponse = new CartResponse();
            cartResponse.setId(c.getId());
            cartResponse.setQuantity(c.getQuantity());

            if (c.getProductVariant() != null) {
                cartResponse.setProductVariant(c.getProductVariant());
                cartResponse.setProduct(c.getProductVariant().getProduct());
            }

            responses.add(cartResponse);
        }

        return responses;
    }

    @Override
    public void upQuantity(Long id) {
        Cart cart = cartRepository.findById(id)
                .orElseThrow(() -> new MessageException("Không tìm thấy giỏ hàng"));

        ProductVariant variant = cart.getProductVariant();
        if (cart.getQuantity() + 1 > variant.getQuantity()) {
            throw new MessageException("Số lượng trong kho không đủ");
        }

        cart.setQuantity(cart.getQuantity() + 1);
        cartRepository.save(cart);
    }

    @Override
    public void downQuantity(Long id) {
        Cart cart = cartRepository.findById(id)
                .orElseThrow(() -> new MessageException("Không tìm thấy giỏ hàng"));

        cart.setQuantity(cart.getQuantity() - 1);
        if (cart.getQuantity() <= 0) {
            cartRepository.deleteById(id);
            return;
        }
        cartRepository.save(cart);
    }

    @Override
    public void removeCart() {
        cartRepository.deleteByUser(userUtils.getUserWithAuthority().getId());
    }

    @Override
    public Long countCart() {
        return cartRepository.countCart(userUtils.getUserWithAuthority().getId());
    }

    @Override
    public Double totalAmountCart() {
        List<Cart> list = cartRepository.findByUser(userUtils.getUserWithAuthority().getId());
        Double total = 0D;
        for (Cart c : list) {
            total += c.getQuantity() * c.getProductVariant().getPrice();
        }
        return total;
    }
}
