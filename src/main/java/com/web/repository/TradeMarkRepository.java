package com.web.repository;

import com.web.entity.Category;
import com.web.entity.TradeMark;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface TradeMarkRepository extends JpaRepository<TradeMark, Long> {

    @Query("select c from TradeMark c where c.name = ?1")
    public Optional<TradeMark> findByName(String name);

    @Query("select c from TradeMark c where c.name = ?1 and c.id <> ?2")
    public Optional<TradeMark> findByNameAndId(String name, Long id);

    @Query("select t from TradeMark t where t.name like ?1")
    Page<TradeMark> findByParam(String s, Pageable pageable);
}
