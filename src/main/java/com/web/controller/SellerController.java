package com.web.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
@RequestMapping("/seller")
public class SellerController {
    @RequestMapping(value = { "/index" }, method = RequestMethod.GET)
    public String dashboard() {
        return "seller/index";
    }

    @RequestMapping(value = { "/addproduct" }, method = RequestMethod.GET)
    public String addproduct() {
        return "seller/addproduct";
    }

    @RequestMapping(value = { "/addvoucher" }, method = RequestMethod.GET)
    public String addvoucher() {
        return "seller/addvoucher";
    }

    @RequestMapping(value = { "/seller-chat" }, method = RequestMethod.GET)
    public String chat() {
        return "seller/seller-chat";
    }

    @RequestMapping(value = { "/danhmuc" }, method = RequestMethod.GET)
    public String danhmuc() {
        return "seller/danhmuc";
    }

    @RequestMapping(value = { "/doanhthu" }, method = RequestMethod.GET)
    public String doanhthu() {
        return "seller/doanhthu";
    }

    @RequestMapping(value = { "/invoice" }, method = RequestMethod.GET)
    public String invoice() {
        return "seller/invoice";
    }

    @RequestMapping(value = { "/product" }, method = RequestMethod.GET)
    public String product() {
        return "seller/product";
    }

    @RequestMapping(value = { "/thuonghieu" }, method = RequestMethod.GET)
    public String thuonghieu() {
        return "seller/thuonghieu";
    }

    @RequestMapping(value = { "/voucher" }, method = RequestMethod.GET)
    public String voucher() {
        return "seller/voucher";
    }

    @RequestMapping(value = { "/baohanh" }, method = RequestMethod.GET)
    public String baohanh() {
        return "seller/baohanh";
    }

}
