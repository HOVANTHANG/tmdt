package com.web.serviceImp;

import com.web.config.Environment;
import com.web.dto.request.InvoiceRequest;
import com.web.dto.response.CartResponse;
import com.web.dto.response.InvoiceResponse;
import com.web.entity.*;
import com.web.enums.PayType;
import com.web.enums.StatusInvoice;
import com.web.exception.MessageException;
import com.web.mapper.InvoiceMapper;
import com.web.models.QueryStatusTransactionResponse;
import com.web.processor.QueryTransactionStatus;
import com.web.repository.*;
import com.web.servive.CartService;
import com.web.servive.InvoiceService;
import com.web.servive.VoucherService;
import com.web.utils.CommonPage;
import com.web.utils.UserUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.sql.Date;
import java.sql.Time;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.List;
import java.util.Optional;

import javax.transaction.Transactional;

@Component
public class InvoiceServiceImp implements InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private HistoryPayRepository historyPayRepository;

    @Autowired
    private UserUtils userUtils;

    @Autowired
    private UserAddressRepository userAddressRepository;

    @Autowired
    private InvoiceDetailRepository invoiceDetailRepository;

    @Autowired
    private VoucherRepository voucherRepository;

    @Autowired
    private VoucherService voucherService;

    @Autowired
    private CommonPage commonPage;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Autowired
    private InvoiceMapper invoiceMapper;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ShopRepository shopRepository;

    @Override
    @Transactional
    public InvoiceResponse create(InvoiceRequest invoiceRequest) {

        // ================= MOMO CHECK =================
        if (invoiceRequest.getPayType().equals(PayType.MOMO)) {

            if (invoiceRequest.getRequestIdMomo() == null || invoiceRequest.getOrderIdMomo() == null) {
                throw new MessageException("orderid and requestid require");
            }

            if (historyPayRepository
                    .findByOrderIdAndRequestId(invoiceRequest.getOrderIdMomo(), invoiceRequest.getRequestIdMomo())
                    .isPresent()) {
                throw new MessageException("Đơn hàng đã được thanh toán");
            }

            try {
                Environment environment = Environment.selectEnv("dev");
                QueryStatusTransactionResponse res = QueryTransactionStatus.process(
                        environment,
                        invoiceRequest.getOrderIdMomo(),
                        invoiceRequest.getRequestIdMomo());

                if (res.getResultCode() != 0) {
                    throw new MessageException("Đơn hàng chưa được thanh toán");
                }

            } catch (Exception e) {
                throw new MessageException("Đơn hàng chưa được thanh toán");
            }
        }

        // ================= ADDRESS =================
        if (invoiceRequest.getUserAddressId() == null) {
            throw new MessageException("user address id require");
        }

        UserAddress address = userAddressRepository.findById(invoiceRequest.getUserAddressId())
                .orElseThrow(() -> new MessageException("user address not found"));

        if (!address.getUser().getId().equals(userUtils.getUserWithAuthority().getId())) {
            throw new MessageException("access denied");
        }

        // ================= TOTAL =================
        Double totalAmount = cartService.totalAmountCart();
        totalAmount += invoiceRequest.getShipCost();

        // ================= CREATE INVOICE =================
        Invoice invoice = new Invoice();
        invoice.setShipCost(invoiceRequest.getShipCost());
        invoice.setCreatedDate(new Date(System.currentTimeMillis()));
        invoice.setCreatedTime(new Time(System.currentTimeMillis()));
        invoice.setUserAddress(address);
        invoice.setNote(invoiceRequest.getNote());
        invoice.setPhone(address.getPhone());
        invoice.setReceiverName(address.getFullname());
        invoice.setPayType(invoiceRequest.getPayType());
        invoice.setStatusInvoice(StatusInvoice.DANG_CHO_XAC_NHAN);

        invoice.setAddress(
                address.getStreetName() + ", " +
                        address.getWards().getName() + ", " +
                        address.getWards().getDistricts().getName() + ", " +
                        address.getWards().getDistricts().getProvince().getName());

        // ================= VOUCHER =================
        if (invoiceRequest.getVoucherCode() != null && !invoiceRequest.getVoucherCode().isEmpty()) {
            Optional<Voucher> voucher = voucherService.findByCode(invoiceRequest.getVoucherCode(), totalAmount);
            if (voucher.isPresent()) {
                totalAmount -= voucher.get().getDiscount();
                invoice.setVoucher(voucher.get());
            }
        }

        invoice.setTotalAmount(totalAmount);
        Invoice savedInvoice = invoiceRepository.save(invoice);

        // ================= CART =================
        List<Cart> carts = cartRepository.findByUser(userUtils.getUserWithAuthority().getId());

        for (Cart c : carts) {

            ProductVariant variant = c.getProductVariant();

            if (variant == null) {
                throw new MessageException("Không tìm thấy biến thể sản phẩm");
            }

            if (variant.getProduct() == null) {
                throw new MessageException("Không tìm thấy sản phẩm");
            }

            Integer cartQty = c.getQuantity() == null ? 0 : c.getQuantity();
            Integer currentQty = variant.getQuantity() == null ? 0 : variant.getQuantity();

            // check tồn kho
            if (currentQty < cartQty) {
                throw new MessageException(
                        "Sản phẩm " + variant.getProduct().getName() + " không đủ hàng");
            }

            // tạo detail
            InvoiceDetail detail = new InvoiceDetail();
            detail.setInvoice(savedInvoice);
            detail.setPrice(variant.getPrice());
            detail.setImportPrice(variant.getImportPrice());
            detail.setQuantity(cartQty);
            detail.setProductVariant(variant);

            invoiceDetailRepository.save(detail);

            // trừ kho
            variant.setQuantity(currentQty - cartQty);
            productVariantRepository.save(variant);

            // KHÔNG tăng sold ở đây
            // sold chỉ tăng khi đơn chuyển sang DA_NHAN
        }

        // ================= MOMO SAVE =================
        if (invoiceRequest.getPayType().equals(PayType.MOMO)) {
            HistoryPay hp = new HistoryPay();
            hp.setInvoice(savedInvoice);
            hp.setRequestId(invoiceRequest.getRequestIdMomo());
            hp.setOrderId(invoiceRequest.getOrderIdMomo());
            hp.setCreatedTime(new Time(System.currentTimeMillis()));
            hp.setCreatedDate(new Date(System.currentTimeMillis()));
            hp.setTotalAmount(totalAmount);
            historyPayRepository.save(hp);
        }

        // ================= CLEAR CART =================
        cartService.removeCart();

        // ================= RESPONSE =================
        InvoiceResponse res = new InvoiceResponse();
        res.setId(savedInvoice.getId());
        res.setTotalAmount(savedInvoice.getTotalAmount());
        res.setStatusInvoice(savedInvoice.getStatusInvoice());
        res.setCreatedDate(savedInvoice.getCreatedDate());
        res.setCreatedTime(savedInvoice.getCreatedTime());

        return res;
    }

    @Override
    public InvoiceResponse updateStatus(Long invoiceId, StatusInvoice statusInvoice) {
        Optional<Invoice> invoice = invoiceRepository.findById(invoiceId);
        if (invoice.isEmpty()) {
            throw new MessageException("invoice id not found");
        }
        invoice.get().setStatusInvoice(statusInvoice);
        Date d = new Date(System.currentTimeMillis());
        try {
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");
            java.util.Date parsedDate = dateFormat.parse(d.toString() + " 00:00:00");
            Timestamp timestamp = new java.sql.Timestamp(parsedDate.getTime());
            invoice.get().setStatusUpdateDate(timestamp);
        } catch (Exception e) { // this generic but you can control another types of exception
            // look the origin of excption
        }

        invoiceRepository.save(invoice.get());
        return null;
    }

    @Override
    public List<InvoiceResponse> findByUser() {
        User user = userUtils.getUserWithAuthority();
        List<Invoice> invoices = invoiceRepository.findByUser(user.getId());
        List<InvoiceResponse> list = invoiceMapper.invoiceListToInvoiceResponseList(invoices);
        return list;
    }

    @Override
    public Page<InvoiceResponse> findAll(Date from, Date to, Pageable pageable) {
        if (from == null || to == null) {
            from = Date.valueOf("2000-01-01");
            to = Date.valueOf("2200-01-01");
        }
        Page<Invoice> page = invoiceRepository.findByDate(from, to, pageable);
        // List<InvoiceResponse> list =
        // invoiceMapper.invoiceListToInvoiceResponseList(page.getContent());
        // Page<InvoiceResponse> result = commonPage.restPage(page,list);
        return null;
    }

    @Override
    @Transactional
    public InvoiceResponse cancelInvoice(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new MessageException("invoice id not found"));

        if (!invoice.getUserAddress().getUser().getId().equals(userUtils.getUserWithAuthority().getId())) {
            throw new MessageException("access denied");
        }

        if (invoice.getStatusInvoice() == null) {
            throw new MessageException("Trạng thái đơn hàng không hợp lệ");
        }

        // chỉ cho hủy khi đơn chưa giao
        if (!(invoice.getStatusInvoice().equals(StatusInvoice.DANG_CHO_XAC_NHAN)
                || invoice.getStatusInvoice().equals(StatusInvoice.DA_XAC_NHAN))) {
            throw new MessageException("Đơn hàng ở trạng thái " + invoice.getStatusInvoice() + " không thể hủy");
        }

        // nếu momo và bạn không muốn cho hủy thì mở lại đoạn này
        // if (invoice.getPayType().equals(PayType.MOMO)) {
        // throw new MessageException("Đơn hàng đã thanh toán MOMO, không thể hủy");
        // }

        List<InvoiceDetail> details = invoiceDetailRepository.findByInvoiceId(invoiceId);

        for (InvoiceDetail d : details) {
            ProductVariant variant = d.getProductVariant();
            if (variant != null) {
                Integer currentQty = variant.getQuantity() == null ? 0 : variant.getQuantity();
                Integer detailQty = d.getQuantity() == null ? 0 : d.getQuantity();

                variant.setQuantity(currentQty + detailQty);
                productVariantRepository.save(variant);
            }

            try {
                Product product = d.getProductVariant() != null ? d.getProductVariant().getProduct() : null;
                if (product != null) {
                    Integer sold = product.getQuantitySold() == null ? 0 : product.getQuantitySold();
                    Integer detailQty = d.getQuantity() == null ? 0 : d.getQuantity();

                    int newSold = sold - detailQty;
                    product.setQuantitySold(Math.max(newSold, 0));
                    productRepository.save(product);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        invoice.setStatusInvoice(StatusInvoice.DA_HUY);
        Invoice result = invoiceRepository.save(invoice);

        InvoiceResponse response = new InvoiceResponse();
        response.setId(result.getId());
        response.setCreatedDate(result.getCreatedDate());
        response.setCreatedTime(result.getCreatedTime());
        response.setStatusInvoice(result.getStatusInvoice());
        response.setTotalAmount(result.getTotalAmount());
        response.setAddress(result.getAddress());
        response.setPhone(result.getPhone());
        response.setReceiverName(result.getReceiverName());
        response.setPayType(result.getPayType());

        return response;
    }

    @Override
    public InvoiceResponse findById(Long invoiceId) {
        Optional<Invoice> invoice = invoiceRepository.findById(invoiceId);
        if (invoice.isEmpty()) {
            throw new MessageException("invoice id not found");
        }
        // if(invoice.get().getUserAddress().getUser().getId() !=
        // userUtils.getUserWithAuthority().getId()){
        // throw new MessageException("access denied");
        // }
        return invoiceMapper.invoiceToInvoiceResponse(invoice.get());
    }

    @Override
    public InvoiceResponse findByIdForAdmin(Long invoiceId) {
        Optional<Invoice> invoice = invoiceRepository.findById(invoiceId);
        if (invoice.isEmpty()) {
            throw new MessageException("invoice id not found");
        }
        return null;
    }

    @Override
    public InvoiceResponse timKiemDonHang(Long id, String phone) {
        Optional<Invoice> invoice = invoiceRepository.findById(id);
        if (invoice.isEmpty()) {
            throw new MessageException("Không tìm thấy đơn hàng");
        }
        if (!invoice.get().getUserAddress().getUser().getPhone().equals(phone)
                && !invoice.get().getPhone().equals(phone)) {
            throw new MessageException("Số điện thoại hoặc mã đơn hàng không chính xác");
        }
        return invoiceMapper.invoiceToInvoiceResponse(invoice.get());
    }

    @Override
    public Page<InvoiceResponse> searchInvoice(String q, Pageable pageable) {
        Page<Invoice> page = invoiceRepository.searchInvoice(q, pageable);
        List<InvoiceResponse> list = invoiceMapper.invoiceListToInvoiceResponseList(page.getContent());
        return commonPage.restPage(page, list);
    }

    @Override
    public Page<InvoiceResponse> findAllFull(Date from, Date to, PayType payType, StatusInvoice statusInvoice,
            Pageable pageable) {
        if (from == null || to == null) {
            from = Date.valueOf("2000-01-01");
            to = Date.valueOf("2200-01-01");
        }
        Page<Invoice> page = null;
        if (payType == null && statusInvoice == null) {
            page = invoiceRepository.findByDate(from, to, pageable);
        }
        if (payType == null && statusInvoice != null) {
            page = invoiceRepository.findByDateAndStatus(from, to, statusInvoice, pageable);
        }
        if (payType != null && statusInvoice == null) {
            page = invoiceRepository.findByDateAndPaytype(from, to, payType, pageable);
        }
        if (payType != null && statusInvoice != null) {
            page = invoiceRepository.findByDateAndPaytypeAndStatus(from, to, payType, statusInvoice, pageable);
        }

        List<InvoiceResponse> list = invoiceMapper.invoiceListToInvoiceResponseList(page.getContent());
        Page<InvoiceResponse> result = commonPage.restPage(page, list);
        return result;
    }

    private Long getCurrentSellerShopId() {
        User currentUser = userUtils.getUserWithAuthority();

        if (currentUser == null) {
            throw new MessageException("Bạn chưa đăng nhập");
        }

        if (currentUser.getAuthorities() == null || currentUser.getAuthorities().getName() == null) {
            throw new MessageException("Không xác định được quyền");
        }

        if (!"ROLE_SELLER".equals(currentUser.getAuthorities().getName())) {
            throw new MessageException("Chỉ seller mới được phép");
        }

        if (currentUser.getShop() == null) {
            throw new MessageException("Tài khoản seller chưa có shop");
        }

        return currentUser.getShop().getId();
    }

    @Override
    public Page<Invoice> findInvoiceBySellerShop(String from, String to, PayType payType, StatusInvoice status,
            Pageable pageable, String sort) {
        Long shopId = getCurrentSellerShopId();

        if (from == null && to == null && payType == null && status == null) {
            return invoiceRepository.findBySellerShop(shopId, pageable);
        }

        return invoiceRepository.findBySellerShopFilter(shopId, payType, status, pageable);
    }

    @Override
    public Invoice findByIdForSeller(Long idInvoice) {
        Long shopId = getCurrentSellerShopId();

        Invoice invoice = invoiceRepository.findById(idInvoice)
                .orElseThrow(() -> new MessageException("Không tìm thấy hóa đơn"));

        boolean hasShopProduct = invoiceDetailRepository.existsByInvoiceIdAndShopId(idInvoice, shopId);
        if (!hasShopProduct) {
            throw new MessageException("Bạn không có quyền xem hóa đơn này");
        }

        return invoice;
    }

    @Override
    @Transactional
    public void updateStatusForSeller(Long idInvoice, StatusInvoice status) {

        Long shopId = getCurrentSellerShopId();

        Invoice invoice = invoiceRepository.findById(idInvoice)
                .orElseThrow(() -> new MessageException("Không tìm thấy hóa đơn"));

        boolean hasShopProduct = invoiceDetailRepository.existsByInvoiceIdAndShopId(
                idInvoice,
                shopId);

        if (!hasShopProduct) {
            throw new MessageException("Bạn không có quyền cập nhật hóa đơn này");
        }

        // trạng thái cũ
        StatusInvoice oldStatus = invoice.getStatusInvoice();

        // update trạng thái mới
        invoice.setStatusInvoice(status);

        invoiceRepository.save(invoice);

        // chỉ cộng sold khi chuyển sang DA_NHAN lần đầu
        if (oldStatus != StatusInvoice.DA_NHAN
                && status == StatusInvoice.DA_NHAN) {

            List<InvoiceDetail> details = invoiceDetailRepository.findByInvoiceId(idInvoice);

            for (InvoiceDetail detail : details) {

                Product product = detail.getProductVariant().getProduct();

                Shop shop = product.getShop();

                // ===== PRODUCT SOLD =====
                if (product.getSold() == null) {
                    product.setSold(0L);
                }

                product.setSold(
                        product.getSold()
                                + detail.getQuantity());

                productRepository.save(product);

                // ===== SHOP SOLD =====
                if (shop != null) {

                    if (shop.getTotalSold() == null) {
                        shop.setTotalSold(0L);
                    }

                    shop.setTotalSold(
                            shop.getTotalSold()
                                    + detail.getQuantity());

                    shopRepository.save(shop);
                }
            }
        }
    }

    @Override
    public Page<Invoice> searchInvoiceForSeller(String q, Pageable pageable) {
        Long shopId = getCurrentSellerShopId();
        return invoiceRepository.searchBySellerShop(shopId, "%" + q + "%", pageable);
    }

}
