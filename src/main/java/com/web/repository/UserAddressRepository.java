package com.web.repository;

import com.web.entity.Category;
import com.web.entity.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface UserAddressRepository extends JpaRepository<UserAddress,Long> {

    @Query("select u from UserAddress u where u.user.id = ?1")
    public List<UserAddress> findByUser(Long userId);

    @Modifying
    @Transactional
    @Query("update UserAddress u set u.primaryAddres = false where u.user.id = ?1")
    int unSetPrimary(Long userId);
}
