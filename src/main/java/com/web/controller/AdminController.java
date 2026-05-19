package com.web.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @RequestMapping(value = { "/addblog" }, method = RequestMethod.GET)
    public String addblog() {
        return "admin/addblog";
    }

    @RequestMapping(value = { "/seller-pending" }, method = RequestMethod.GET)
    public String sellerPending() {
        return "admin/seller-pending";
    }

    @RequestMapping(value = { "/shop" }, method = RequestMethod.GET)
    public String shop() {
        return "admin/shop";
    }

    @RequestMapping(value = { "/shop-statistic" }, method = RequestMethod.GET)
    public String shopStatistic() {
        return "admin/shop-statistic";
    }

    @RequestMapping(value = { "/addproduct" }, method = RequestMethod.GET)
    public String addproduct() {
        return "admin/addproduct";
    }

    @RequestMapping(value = { "/addvoucher" }, method = RequestMethod.GET)
    public String addvoucher() {
        return "admin/addvoucher";
    }

    @RequestMapping(value = { "/banner" }, method = RequestMethod.GET)
    public String banner() {
        return "admin/banner";
    }

    @RequestMapping(value = { "/blog" }, method = RequestMethod.GET)
    public String blog() {
        return "admin/blog";
    }

    @RequestMapping(value = { "/chat" }, method = RequestMethod.GET)
    public String chat() {
        return "admin/chat";
    }

    @RequestMapping(value = { "/danhmuc" }, method = RequestMethod.GET)
    public String danhmuc() {
        return "admin/danhmuc";
    }

    @RequestMapping(value = { "/doanhthu" }, method = RequestMethod.GET)
    public String doanhthu() {
        return "admin/doanhthu";
    }

    @RequestMapping(value = { "/invoice" }, method = RequestMethod.GET)
    public String invoice() {
        return "admin/invoice";
    }

    @RequestMapping(value = { "/product" }, method = RequestMethod.GET)
    public String product() {
        return "admin/product";
    }

    @RequestMapping(value = { "/taikhoan" }, method = RequestMethod.GET)
    public String taikhoan() {
        return "admin/taikhoan";
    }

    @RequestMapping(value = { "/thuonghieu" }, method = RequestMethod.GET)
    public String thuonghieu() {
        return "admin/thuonghieu";
    }

    @RequestMapping(value = { "/voucher" }, method = RequestMethod.GET)
    public String voucher() {
        return "admin/voucher";
    }

    @RequestMapping(value = { "/addimportproduct" }, method = RequestMethod.GET)
    public String addimportproduct() {
        return "admin/addimportproduct";
    }

    @RequestMapping(value = { "/importproduct" }, method = RequestMethod.GET)
    public String importproduct() {
        return "admin/importproduct";
    }

    @RequestMapping(value = { "/provider" }, method = RequestMethod.GET)
    public String provider() {
        return "admin/provider";
    }

    @RequestMapping(value = { "/add-provider" }, method = RequestMethod.GET)
    public String addProvider() {
        return "admin/addprovider";
    }

    @RequestMapping(value = { "/baohanh" }, method = RequestMethod.GET)
    public String baohanh() {
        return "admin/baohanh";
    }

    @RequestMapping(value = { "/product-approval" }, method = RequestMethod.GET)
    public String productApproval() {
        return "admin/product-approval";
    }

    @RequestMapping(value = { "/commission" }, method = RequestMethod.GET)
    public String commission() {
        return "admin/commission";
    }

}
