package com.web.servive;

import com.web.entity.Category;
import com.web.entity.TradeMark;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface TradeMarkService {

    public List<TradeMark> findAllList();

    public Page<TradeMark> search(String param, Pageable pageable);

    public TradeMark save(TradeMark tradeMark);

    public TradeMark update(TradeMark tradeMark);

    public void delete(Long id);

    public TradeMark findById(Long id);

}
