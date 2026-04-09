package com.web.api;
import com.web.entity.Provider;
import com.web.servive.ProviderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/provider/admin") // Định dạng đường dẫn cơ bản
public class ProviderApi {

    @Autowired
    private ProviderService providerService;

    @GetMapping("/all")
    public ResponseEntity<List<Provider>> getAllProviders() {
        List<Provider> providers = providerService.findAllProviders();
        return new ResponseEntity<>(providers, HttpStatus.OK);
    }

    @GetMapping("/findById")
    public ResponseEntity<Provider> getProviderById(@RequestParam("id") Long id) {
        return providerService.findProviderById(id)
                .map(provider -> new ResponseEntity<>(provider, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }


    @PostMapping("/create")
    public ResponseEntity<Provider> createProvider(@Valid @RequestBody Provider provider) {
        try {
            Provider savedProvider = providerService.saveProvider(provider);
            return new ResponseEntity<>(savedProvider, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(null, HttpStatus.CONFLICT); // 409 Conflict
        }
    }

    @PutMapping("/update")
    public ResponseEntity<Provider> updateProvider(@RequestParam("id") Long id, @Valid @RequestBody Provider providerDetails) {
        // Kiểm tra xem Nhà cung cấp có tồn tại không
        return providerService.findProviderById(id)
                .map(existingProvider -> {
                    // Cập nhật thông tin từ providerDetails vào existingProvider
                    existingProvider.setName(providerDetails.getName());
                    existingProvider.setAddress(providerDetails.getAddress());
                    existingProvider.setPhoneNumber(providerDetails.getPhoneNumber());
                    existingProvider.setEmail(providerDetails.getEmail());
                    existingProvider.setIsActive(providerDetails.getIsActive());

                    // Lưu lại
                    Provider updatedProvider = providerService.saveProvider(existingProvider);
                    return new ResponseEntity<>(updatedProvider, HttpStatus.OK);
                })
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<HttpStatus> deleteProvider(@RequestParam("id") Long id) {
        try {
            providerService.deleteProvider(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204 No Content
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // 404 Not Found
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Provider>> searchProviders(@RequestParam("name") String name) {
        List<Provider> providers = providerService.searchProvidersByName(name);
        if (providers.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204 No Content nếu không tìm thấy
        }
        return new ResponseEntity<>(providers, HttpStatus.OK);
    }
}
