package com.web.api;

import com.web.dto.request.BlogRequest;
import com.web.dto.request.DiagnosisFeeUpdateRequest;
import com.web.dto.request.GuaranteeRequest;
import com.web.dto.response.BlogResponse;
import com.web.entity.Guarantee;
import com.web.enums.GuaranteeStatus;
import com.web.serviceImp.GuaranteeService;
import com.web.servive.BlogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/guarantee")
@CrossOrigin
public class GuaranteeApi {

    @Autowired
    private GuaranteeService guaranteeService;

    @PostMapping("/user/create")
    public ResponseEntity<?> save(@RequestBody GuaranteeRequest request){
        Guarantee result = guaranteeService.create(request);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @PostMapping("/user/cancel")
    public ResponseEntity<?> cancel(@RequestParam Long id){
        guaranteeService.cancel(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/user/find-by-user")
    public ResponseEntity<?> findByUser(){
        List<Guarantee> result = guaranteeService.findByUser();
        return new ResponseEntity<>(result,HttpStatus.OK);
    }


    // --- 1. API Phân trang và Tìm kiếm ---
    @GetMapping("/admin/list")
    public ResponseEntity<Page<Guarantee>> getGuarantees(
            @RequestParam(defaultValue = "") String search, Pageable pageable
        ) {
        Page<Guarantee> guarantees = guaranteeService.findGuaranteesByText(search, pageable);
        return ResponseEntity.ok(guarantees);
    }

    // --- 2. API Cập nhật Trạng thái ---
    // Cần một DTO đơn giản cho request này
    public record StatusUpdateRequest(GuaranteeStatus status, String staffNote) {}

    @PutMapping("/admin/update-status/{id}")
    public ResponseEntity<Guarantee> updateStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request) {

        Guarantee updatedGuarantee = guaranteeService.updateGuaranteeStatus(
                id,
                request.status(),
                request.staffNote()
        );
        return ResponseEntity.ok(updatedGuarantee);
    }

    // --- 3. API Lấy danh sách ENUM trạng thái cho Dropdown (Frontend) ---
    @GetMapping("/admin/statuses")
    public ResponseEntity<Map<String, Object>> getGuaranteeStatuses() {
        // Trả về map các trạng thái để Frontend render dropdown
        Map<String, Object> statuses = new LinkedHashMap<>();
        for (GuaranteeStatus status : GuaranteeStatus.values()) {
            statuses.put(status.name(), Map.of("label", status.getLabel(), "color", status.getColor()));
        }
        return ResponseEntity.ok(statuses);
    }

    @PutMapping("/admin/update-diagnosis-fee/{id}")
    public ResponseEntity<Guarantee> updateDiagnosisFee(
            @PathVariable Long id,
            @RequestBody DiagnosisFeeUpdateRequest request) {

        Guarantee updatedGuarantee = guaranteeService.updateDiagnosisAndFee(id, request);
        return ResponseEntity.ok(updatedGuarantee);
    }

}
