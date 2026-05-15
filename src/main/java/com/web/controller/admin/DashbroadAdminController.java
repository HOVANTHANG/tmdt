package com.web.controller.admin;

import com.web.enums.StatusInvoice;
import com.web.repository.InvoiceRepository;
import com.web.repository.ProductRepository;
import com.web.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;

@Controller
@RequestMapping("/admin")
public class DashbroadAdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private ProductRepository productRepository;

    @RequestMapping(value = { "/index" }, method = RequestMethod.GET)
    public String index(Model model) {
        Date date = new Date(System.currentTimeMillis());
        String[] str = date.toString().split("-");
        Integer year = Integer.valueOf(str[0]);
        Integer month = Integer.valueOf(str[1]);
        model.addAttribute("numAdmin", userRepository.countAdmin("ROLE_ADMIN"));
        model.addAttribute("numUser", userRepository.countAdmin("ROLE_USER"));
        int index = Arrays.asList(StatusInvoice.values()).indexOf(StatusInvoice.DA_NHAN);
        model.addAttribute("doanhThuThangNay", invoiceRepository.calDt(month, year, index));
        model.addAttribute("sanPhamBanChay", productRepository.findTop10Selling());

        LocalDate localDate = date.toLocalDate();
        LocalDateTime startOfDay = localDate.atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        model.addAttribute("soDonHoanThanhHomNay",
                invoiceRepository.numInvoiceToDay(new Date(System.currentTimeMillis()), index));
        model.addAttribute("doanhThuHomNay",
                invoiceRepository.revenueByDate(new Date(System.currentTimeMillis()), index));

        return "admin/index";
    }
}
