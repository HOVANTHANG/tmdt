package com.web.serviceImp;

import com.web.dto.request.DiagnosisFeeUpdateRequest;
import com.web.dto.request.GuaranteeRequest;
import com.web.entity.Guarantee;
import com.web.entity.GuaranteeHistory;
import com.web.entity.InvoiceDetail;
import com.web.entity.User;
import com.web.enums.GuaranteeStatus;
import com.web.exception.MessageException;
import com.web.repository.GuaranteeHistoryRepository;
import com.web.repository.GuaranteeRepository;
import com.web.repository.InvoiceDetailRepository;
import com.web.utils.UserUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class GuaranteeService {

    @Autowired
    private GuaranteeRepository guaranteeRepository;

    @Autowired
    private UserUtils userUtils;

    @Autowired
    private GuaranteeHistoryRepository guaranteeHistoryRepository;

    @Autowired
    private InvoiceDetailRepository invoiceDetailRepository;

    @Transactional
    public Guarantee create(GuaranteeRequest request) {
        InvoiceDetail invoiceDetail = invoiceDetailRepository.findById(request.getInvoiceDetailId())
                .orElseThrow(() -> new MessageException("Không tìm thấy chi tiết hóa đơn."));

        // 2. Định nghĩa các trạng thái Đang xử lý
        List<GuaranteeStatus> inProgressStatuses = List.of(
                GuaranteeStatus.ACCEPT,
                GuaranteeStatus.RECEIVED,
                GuaranteeStatus.IN_PROGRESS,
                GuaranteeStatus.PENDING_PARTS);

        List<Guarantee> existingGuarantees = guaranteeRepository.findExistingInProgressGuarantee(
                request.getInvoiceDetailId(),
                inProgressStatuses);

        if (!existingGuarantees.isEmpty()) {
            throw new MessageException("Chi tiết hóa đơn này đã có yêu cầu bảo hành đang được xử lý.");
        }

        java.sql.Date sqlCreatedDate = invoiceDetail.getInvoice().getCreatedDate();
        java.time.LocalDate invoiceDate = sqlCreatedDate.toLocalDate();
        java.time.LocalDate twoYearsAgo = java.time.LocalDate.now().minusYears(2);
        if (invoiceDate.isBefore(twoYearsAgo)) {
            throw new MessageException("Sản phẩm đã hết thời hạn bảo hành (quá 2 năm).");
        }
        Guarantee guarantee = new Guarantee();
        guarantee.setGuaranteeStatus(GuaranteeStatus.ACCEPT);
        guarantee.setDescription(request.getDescription());
        guarantee.setInvoiceDetail(invoiceDetail);
        guarantee.setCustomerName(request.getCustomerName());
        guarantee.setUser(userUtils.getUserWithAuthority());
        guarantee.setCustomerPhone(request.getCustomerPhone());
        if (invoiceDetail.getProductVariant() == null) {
            throw new MessageException("Không tìm thấy biến thể sản phẩm");
        }
        guarantee.setProductId(invoiceDetail.getProductVariant().getProduct().getId());
        guarantee.setProductName(invoiceDetail.getProductVariant().getProduct().getName());
        guarantee.setProductVariantTier1(invoiceDetail.getProductVariant().getTier1value());
        guarantee.setProductVariantTier2(invoiceDetail.getProductVariant().getTier2value());
        // guarantee.setImpo(invoiceDetail.());
        guaranteeRepository.save(guarantee);

        String date = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        String random = UUID.randomUUID().toString().substring(0, 3).toUpperCase(); // 6 ký tự
        guarantee.setCode("BH-" + date + "-" + random + "-" + guarantee.getId());
        guaranteeRepository.save(guarantee);

        GuaranteeHistory guaranteeHistory = new GuaranteeHistory();
        guaranteeHistory.setGuarantee(guarantee);
        guaranteeHistory.setGuaranteeStatus(GuaranteeStatus.ACCEPT);
        guaranteeHistoryRepository.save(guaranteeHistory);

        return null;
    }

    public List<Guarantee> findByUser() {
        User user = userUtils.getUserWithAuthority();
        List<Guarantee> guarantees = guaranteeRepository.findByUser(user.getId());
        return guarantees;
    }

    public void cancel(Long id) {
        Guarantee guarantee = guaranteeRepository.findById(id).get();
        if (!guarantee.getGuaranteeStatus().equals(GuaranteeStatus.ACCEPT)) {
            guarantee.setGuaranteeStatus(GuaranteeStatus.CANCELED);
            guaranteeRepository.save(guarantee);

            GuaranteeHistory guaranteeHistory = new GuaranteeHistory();
            guaranteeHistory.setGuaranteeStatus(GuaranteeStatus.CANCELED);
            guaranteeHistory.setGuarantee(guarantee);
            guaranteeHistoryRepository.save(guaranteeHistory);
        } else {
            throw new MessageException("Không thể hủy yêu cầu");
        }
    }

    public Page<Guarantee> findGuaranteesByText(String text, Pageable pageable) {
        String searchText = text.toLowerCase();
        return guaranteeRepository.findByText(searchText, pageable);
    }

    @Transactional
    public Guarantee updateGuaranteeStatus(Long guaranteeId, GuaranteeStatus newStatus, String staffNote) {
        Guarantee guarantee = guaranteeRepository.findById(guaranteeId)
                .orElseThrow(() -> new MessageException("Không tìm thấy yêu cầu bảo hành."));
        GuaranteeStatus currentStatus = guarantee.getGuaranteeStatus();
        if (currentStatus == GuaranteeStatus.CANCELED || currentStatus == GuaranteeStatus.REJECTED) {
            throw new MessageException("Không thể cập nhật trạng thái đã Hủy hoặc Từ chối.");
        }
        guarantee.setGuaranteeStatus(newStatus);
        if (newStatus == GuaranteeStatus.COMPLETED) {
        }
        Guarantee updatedGuarantee = guaranteeRepository.save(guarantee);
        GuaranteeHistory guaranteeHistory = new GuaranteeHistory();
        guaranteeHistory.setGuarantee(updatedGuarantee);
        guaranteeHistory.setGuaranteeStatus(newStatus);
        guaranteeHistoryRepository.save(guaranteeHistory);

        return updatedGuarantee;
    }

    @Transactional
    public Guarantee updateDiagnosisAndFee(Long guaranteeId, DiagnosisFeeUpdateRequest request) {
        Guarantee guarantee = guaranteeRepository.findById(guaranteeId)
                .orElseThrow(() -> new MessageException("Không tìm thấy yêu cầu bảo hành."));

        // Cập nhật chẩn đoán và phí
        guarantee.setErrorDiagnosis(request.errorDiagnosis());
        // Đảm bảo phí không null và không âm
        guarantee.setFee(request.fee() != null && request.fee() >= 0 ? request.fee() : 0);

        return guaranteeRepository.save(guarantee);
    }
}
