package com.web.controller.admin;

import com.web.repository.InvoiceDetailRepository;
import com.web.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/admin")
public class IndonAdminController {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private InvoiceDetailRepository invoiceDetailRepository;

    @RequestMapping(value = {"/in-don"}, method = RequestMethod.GET)
    public String indon(Model model, @RequestParam Long id) {
        model.addAttribute("hoaDon", invoiceRepository.findById(id).get());
        model.addAttribute("ctHoaDon", invoiceDetailRepository.findByInvoiceId(id));
        return "admin/indon";
    }
}
