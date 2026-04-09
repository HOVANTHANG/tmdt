package com.web.repository;

import com.web.entity.Provider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProviderRepository extends JpaRepository<Provider, Long> {

    /**
     * Phương thức tìm kiếm nhà cung cấp theo tên (ví dụ: tìm kiếm theo tên gần đúng)
     * Spring Data JPA sẽ tự động tạo truy vấn SQL từ tên phương thức này
     * Tương đương với: SELECT * FROM providers WHERE name LIKE ?
     */
    List<Provider> findByNameContainingIgnoreCase(String name);

    /**
     * Phương thức tìm kiếm nhà cung cấp theo Email
     * Tương đương với: SELECT * FROM providers WHERE email = ?
     */
    Provider findByEmail(String email);

    /**
     * Phương thức kiểm tra sự tồn tại của nhà cung cấp dựa trên tên
     */
    boolean existsByName(String name);
}