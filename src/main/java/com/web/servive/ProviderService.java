package com.web.servive;

import com.web.entity.Provider;
import com.web.repository.ProviderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional // Đảm bảo tất cả các phương thức đều được quản lý giao dịch
public class ProviderService {

    private final ProviderRepository providerRepository;

    @Autowired
    public ProviderService(ProviderRepository providerRepository) {
        this.providerRepository = providerRepository;
    }

    /**
     * Lấy tất cả các nhà cung cấp
     */
    public List<Provider> findAllProviders() {
        return providerRepository.findAll();
    }

    /**
     * Lấy nhà cung cấp theo ID
     */
    public Optional<Provider> findProviderById(Long id) {
        return providerRepository.findById(id);
    }

    /**
     * Lưu (tạo mới hoặc cập nhật) nhà cung cấp
     * @param provider: Đối tượng nhà cung cấp cần lưu
     * @return Provider: Đối tượng đã được lưu vào CSDL
     */
    public Provider saveProvider(Provider provider) {
        // Ví dụ về logic nghiệp vụ: kiểm tra tên đã tồn tại chưa trước khi lưu
        if (provider.getId() == null && providerRepository.existsByName(provider.getName())) {
            throw new IllegalStateException("Tên nhà cung cấp đã tồn tại: " + provider.getName());
        }
        return providerRepository.save(provider);
    }

    /**
     * Xóa nhà cung cấp theo ID
     */
    public void deleteProvider(Long id) {
        // Logic nghiệp vụ: kiểm tra xem nhà cung cấp có tồn tại trước khi xóa
        if (!providerRepository.existsById(id)) {
            throw new IllegalStateException("Không tìm thấy nhà cung cấp với ID: " + id + " để xóa.");
        }
        providerRepository.deleteById(id);
    }

    /**
     * Tìm kiếm nhà cung cấp theo tên (sử dụng phương thức tùy chỉnh từ Repository)
     */
    public List<Provider> searchProvidersByName(String name) {
        return providerRepository.findByNameContainingIgnoreCase(name);
    }
}
