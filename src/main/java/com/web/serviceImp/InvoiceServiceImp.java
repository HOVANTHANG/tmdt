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
    private ProductColorRepository productColorRepository;

    @Autowired
    private InvoiceMapper invoiceMapper;

    @Override
    public InvoiceResponse create(InvoiceRequest invoiceRequest) {
        if(invoiceRequest.getPayType().equals(PayType.MOMO)){
            if(invoiceRequest.getRequestIdMomo() == null || invoiceRequest.getOrderIdMomo() == null){
                throw new MessageException("orderid and requestid require");
            }
            if(historyPayRepository.findByOrderIdAndRequestId(invoiceRequest.getOrderIdMomo(), invoiceRequest.getRequestIdMomo()).isPresent()){
                throw new MessageException("Đơn hàng đã được thanh toán");
            }
            Environment environment = Environment.selectEnv("dev");
            try {
                QueryStatusTransactionResponse queryStatusTransactionResponse = QueryTransactionStatus.process(environment, invoiceRequest.getOrderIdMomo(), invoiceRequest.getRequestIdMomo());
                System.out.println("qqqq-----------------------------------------------------------"+queryStatusTransactionResponse.getMessage());
                if(queryStatusTransactionResponse.getResultCode() != 0){
                    throw new MessageException("Đơn hàng chưa được thanh toán");
                }
            } catch (Exception e) {
                e.printStackTrace();
                throw new MessageException("Đơn hàng chưa được thanh toán");
            }
        }
        if(invoiceRequest.getUserAddressId() == null){
            throw new MessageException("user address id require");
        }
        Optional<UserAddress> userAddress = userAddressRepository.findById(invoiceRequest.getUserAddressId());
        if(userAddress.isEmpty()){
            throw new MessageException("user address not found");
        }
        if(userAddress.get().getUser().getId() != userUtils.getUserWithAuthority().getId()){
            throw new MessageException("access deneid");
        }
        Double totalAmount = cartService.totalAmountCart();
        totalAmount+= invoiceRequest.getShipCost();


        Invoice invoice = new Invoice();
        invoice.setShipCost(invoiceRequest.getShipCost());
        invoice.setCreatedDate(new Date(System.currentTimeMillis()));
        invoice.setCreatedTime(new Time(System.currentTimeMillis()));
        invoice.setUserAddress(userAddress.get());
        invoice.setNote(invoiceRequest.getNote());
        invoice.setPhone(userAddress.get().getPhone());
        invoice.setAddress(userAddress.get().getStreetName()+", "+userAddress.get().getWards().getName()+", "+userAddress.get().getWards().getDistricts().getName()+". "+userAddress.get().getWards().getDistricts().getProvince().getName());
        invoice.setReceiverName(userAddress.get().getFullname());
        invoice.setPayType(invoiceRequest.getPayType());
        invoice.setStatusInvoice(StatusInvoice.DANG_CHO_XAC_NHAN);
        if(invoiceRequest.getVoucherCode() != null){
            if(!invoiceRequest.getVoucherCode().equals("null") && !invoiceRequest.getVoucherCode().equals("")){
                System.out.println("voucher use === "+invoiceRequest.getVoucherCode());
                Optional<Voucher> voucher = voucherService.findByCode(invoiceRequest.getVoucherCode(), totalAmount);
                if(voucher.isPresent()){
                    totalAmount = totalAmount - voucher.get().getDiscount();
                    invoice.setVoucher(voucher.get());
                }
            }
        }
        invoice.setTotalAmount(totalAmount);
        Invoice result = invoiceRepository.save(invoice);
        List<CartResponse> list = cartService.findByUser();
        for(CartResponse c : list){
            InvoiceDetail invoiceDetail = new InvoiceDetail();
            invoiceDetail.setInvoice(result);
            invoiceDetail.setPrice(c.getProductColor().getPrice());
            invoiceDetail.setQuantity(c.getQuantity());
            invoiceDetail.setProductColor(c.getProductColor());
            invoiceDetailRepository.save(invoiceDetail);
            c.getProductColor().setQuantity(c.getProductColor().getQuantity() - c.getQuantity());
            productColorRepository.save(c.getProductColor());
            try {
                c.getProduct().setQuantitySold(c.getProduct().getQuantitySold() + c.getQuantity());
                productRepository.save(c.getProduct());
            }catch (Exception e){}
        }

        if(invoiceRequest.getPayType().equals(PayType.MOMO)){
            HistoryPay historyPay = new HistoryPay();
            historyPay.setInvoice(result);
            historyPay.setRequestId(invoiceRequest.getRequestIdMomo());
            historyPay.setOrderId(invoiceRequest.getOrderIdMomo());
            historyPay.setCreatedTime(new Time(System.currentTimeMillis()));
            historyPay.setCreatedDate(new Date(System.currentTimeMillis()));
            historyPay.setTotalAmount(totalAmount);
            historyPayRepository.save(historyPay);
        }
        cartService.removeCart();
        return null;
    }

    @Override
    public InvoiceResponse updateStatus(Long invoiceId, StatusInvoice statusInvoice) {
        Optional<Invoice> invoice = invoiceRepository.findById(invoiceId);
        if(invoice.isEmpty()){
            throw new MessageException("invoice id not found");
        }
        invoice.get().setStatusInvoice(statusInvoice);
        Date d = new Date(System.currentTimeMillis());
        try {
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");
            java.util.Date parsedDate = dateFormat.parse(d.toString()+" 00:00:00");
            Timestamp timestamp = new java.sql.Timestamp(parsedDate.getTime());
            invoice.get().setStatusUpdateDate(timestamp);
        } catch(Exception e) { //this generic but you can control another types of exception
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
        if(from == null || to == null){
            from = Date.valueOf("2000-01-01");
            to = Date.valueOf("2200-01-01");
        }
        Page<Invoice> page = invoiceRepository.findByDate(from, to,pageable);
//        List<InvoiceResponse> list = invoiceMapper.invoiceListToInvoiceResponseList(page.getContent());
//        Page<InvoiceResponse> result = commonPage.restPage(page,list);
        return null;
    }

    @Override
    public InvoiceResponse cancelInvoice(Long invoiceId) {
        Optional<Invoice> invoice = invoiceRepository.findById(invoiceId);
        if(invoice.isEmpty()){
            throw new MessageException("invoice id not found");
        }
        if(invoice.get().getUserAddress().getUser().getId() != userUtils.getUserWithAuthority().getId()){
            throw new MessageException("access denied");
        }
//        if(invoice.get().getPayType().equals(PayType.PAYMENT_MOMO)){
//            throw new MessageException("Đơn hàng đã được thanh toán, không thể hủy");
//        }
//        Long idSt = invoice.get().getStatus().getId();
//        if(idSt == StatusUtils.DA_GUI || idSt == StatusUtils.DA_NHAN || idSt == StatusUtils.DA_HUY || idSt == StatusUtils.KHONG_NHAN_HANG){
//            throw new MessageException(invoice.get().getStatus().getName()+ " không thể hủy hàng");
//        }
//        invoice.get().setStatus(statusRepository.findById(StatusUtils.DA_HUY).get());
//        Invoice result = invoiceRepository.save(invoice.get());
//        List<InvoiceDetail> list  = invoiceDetailRepository.findByInvoiceId(invoiceId);
//        for(InvoiceDetail i : list){
//            i.getProductSize().setQuantity(i.getQuantity() + i.getProductSize().getQuantity());
//            productSizeRepository.save(i.getProductSize());
//        }
//        InvoiceStatus invoiceStatus = new InvoiceStatus();
//        invoiceStatus.setInvoice(invoice.get());
//        invoiceStatus.setCreatedDate(new Date(System.currentTimeMillis()));
//        invoiceStatus.setCreatedTime(new Time(System.currentTimeMillis()));
//        invoiceStatus.setStatus(statusRepository.findById(StatusUtils.DA_HUY).get());
//        invoiceStatusRepository.save(invoiceStatus);
        return null;
    }

    @Override
    public InvoiceResponse findById(Long invoiceId) {
        Optional<Invoice> invoice = invoiceRepository.findById(invoiceId);
        if(invoice.isEmpty()){
            throw new MessageException("invoice id not found");
        }
//        if(invoice.get().getUserAddress().getUser().getId() != userUtils.getUserWithAuthority().getId()){
//            throw new MessageException("access denied");
//        }
        return invoiceMapper.invoiceToInvoiceResponse(invoice.get());
    }

    @Override
    public InvoiceResponse findByIdForAdmin(Long invoiceId) {
        Optional<Invoice> invoice = invoiceRepository.findById(invoiceId);
        if(invoice.isEmpty()){
            throw new MessageException("invoice id not found");
        }
        return null;
    }

    @Override
    public InvoiceResponse timKiemDonHang(Long id, String phone) {
        Optional<Invoice> invoice = invoiceRepository.findById(id);
        if(invoice.isEmpty()){
            throw new MessageException("Không tìm thấy đơn hàng");
        }
        if(!invoice.get().getUserAddress().getUser().getPhone().equals(phone) && !invoice.get().getPhone().equals(phone)){
            throw new MessageException("Số điện thoại hoặc mã đơn hàng không chính xác");
        }
        return invoiceMapper.invoiceToInvoiceResponse(invoice.get());
    }
    @Override
    public Page<InvoiceResponse> searchInvoice(String q, Pageable pageable) {
        Page<Invoice> page = invoiceRepository.searchInvoice(q, pageable);
        List<InvoiceResponse> list =
                invoiceMapper.invoiceListToInvoiceResponseList(page.getContent());
        return commonPage.restPage(page, list);
    }

    @Override
    public Page<InvoiceResponse> findAllFull(Date from, Date to, PayType payType, StatusInvoice statusInvoice, Pageable pageable) {
        if(from == null || to == null){
            from = Date.valueOf("2000-01-01");
            to = Date.valueOf("2200-01-01");
        }
        Page<Invoice> page = null;
        if(payType == null && statusInvoice == null){
            page = invoiceRepository.findByDate(from, to,pageable);
        }
        if(payType == null && statusInvoice != null){
            page = invoiceRepository.findByDateAndStatus(from, to, statusInvoice,pageable);
        }
        if(payType != null && statusInvoice == null){
            page = invoiceRepository.findByDateAndPaytype(from, to,payType,pageable);
        }
        if(payType != null && statusInvoice != null){
            page = invoiceRepository.findByDateAndPaytypeAndStatus(from, to,payType,statusInvoice,pageable);
        }

        List<InvoiceResponse> list = invoiceMapper.invoiceListToInvoiceResponseList(page.getContent());
        Page<InvoiceResponse> result = commonPage.restPage(page,list);
        return result;
    }

    @Override
    public void updateImei(Long detailId, String imei) {
        InvoiceDetail invoiceDetail = invoiceDetailRepository.findById(detailId).get();
        Long idCheck = invoiceDetailRepository.findByIdAndImei(detailId, imei);
        if(idCheck != null){
            throw new MessageException("Imei đã được sử dụng");
        }
        invoiceDetail.setImei(imei);
        invoiceDetailRepository.save(invoiceDetail);
    }
}
