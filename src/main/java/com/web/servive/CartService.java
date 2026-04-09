package com.web.servive;

import com.web.dto.response.CartResponse;
import com.web.entity.Cart;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface CartService {

    public void addCart(Long productColorId);

    public void remove(Long id);

    List<CartResponse> findByUser();

    public void upQuantity(Long id);

    public void downQuantity(Long id);

    public void removeCart();

    public Long countCart();

    public Double totalAmountCart();
}
