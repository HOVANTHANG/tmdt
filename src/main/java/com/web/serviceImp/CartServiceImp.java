package com.web.serviceImp;

import com.web.dto.response.CartResponse;
import com.web.entity.Cart;
import com.web.entity.ProductColor;
import com.web.entity.User;
import com.web.exception.MessageException;
import com.web.repository.CartRepository;
import com.web.repository.ProductColorRepository;
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
    private ProductColorRepository productColorRepository;

    @Override
    public void addCart(Long productColorId) {
        Cart cart = new Cart();
        User user = userUtils.getUserWithAuthority();
        Optional<Cart> c = cartRepository.findByColorAndUser(user.getId(), productColorId);
        if(c.isPresent()){
            return;
        }
        Optional<ProductColor> productColor = productColorRepository.findById(productColorId);
        if (productColor.isEmpty()){
            throw new MessageException("Không tìm thấy color");
        }
        cart.setUser(user);
        cart.setQuantity(1);
        cart.setProductColor(productColor.get());
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
        for(Cart c : list){
            CartResponse cartResponse = new CartResponse();
            cartResponse.setProductColor(c.getProductColor());
            cartResponse.setQuantity(c.getQuantity());
            cartResponse.setProduct(c.getProductColor().getProductStorage().getProduct());
            cartResponse.setId(c.getId());
            cartResponse.setProductStorage(c.getProductColor().getProductStorage());
            responses.add(cartResponse);
        }
        return responses;
    }

    @Override
    public void upQuantity(Long id) {
        Cart cart = cartRepository.findById(id).get();
        cart.setQuantity(cart.getQuantity() + 1);
        cartRepository.save(cart);
    }

    @Override
    public void downQuantity(Long id) {
        Cart cart = cartRepository.findById(id).get();
        cart.setQuantity(cart.getQuantity() - 1);
        if(cart.getQuantity() == 0){
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
        for(Cart c : list){
            total += c.getQuantity() * c.getProductColor().getPrice();
        }
        return total;
    }
}
