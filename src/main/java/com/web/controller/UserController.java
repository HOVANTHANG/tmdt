package com.web.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
public class UserController {

    @RequestMapping(value = { "/baiviet" }, method = RequestMethod.GET)
    public String baiviet() {
        return "user/baiviet";
    }

    @RequestMapping(value = { "/sellerregister" }, method = RequestMethod.GET)
    public String sellerregister() {
        return "user/sellerregister";
    }

    @RequestMapping(value = { "/chitietbaiviet" }, method = RequestMethod.GET)
    public String chitietbaiviet() {
        return "user/chitietbaiviet";
    }

    @RequestMapping(value = { "/dangky" }, method = RequestMethod.GET)
    public String dangky() {
        return "user/dangky";
    }

    @RequestMapping(value = { "/dangnhap" }, method = RequestMethod.GET)
    public String dangnhap() {
        return "user/dangnhap";
    }

    @RequestMapping(value = { "/datlaimatkhau" }, method = RequestMethod.GET)
    public String datlaimatkhau() {
        return "user/datlaimatkhau";
    }

    @RequestMapping(value = { "/detail" }, method = RequestMethod.GET)
    public String detail() {
        return "user/detail";
    }

    @RequestMapping(value = { "/diachi" }, method = RequestMethod.GET)
    public String diachi() {
        return "user/diachi";
    }

    @RequestMapping(value = { "/giohang" }, method = RequestMethod.GET)
    public String giohang() {
        return "user/giohang";
    }

    @RequestMapping(value = { "/index", "/" }, method = RequestMethod.GET)
    public String index() {
        return "user/index";
    }

    @RequestMapping(value = { "/product" }, method = RequestMethod.GET)
    public String product() {
        return "user/product";
    }

    @RequestMapping(value = { "/quenmatkhau" }, method = RequestMethod.GET)
    public String quenmatkhau() {
        return "user/quenmatkhau";
    }

    @RequestMapping(value = { "/taikhoan" }, method = RequestMethod.GET)
    public String taikhoan() {
        return "user/taikhoan";
    }

    @RequestMapping(value = { "/thanhcong" }, method = RequestMethod.GET)
    public String thanhcong() {
        return "user/thanhcong";
    }

    @RequestMapping(value = { "/thanhtoan" }, method = RequestMethod.GET)
    public String thanhtoan() {
        return "user/thanhtoan";
    }

    @RequestMapping(value = { "/timdonhang" }, method = RequestMethod.GET)
    public String timdonhang() {
        return "user/timdonhang";
    }

    @RequestMapping(value = { "/xacnhan" }, method = RequestMethod.GET)
    public String xacnhan() {
        return "user/xacnhan";
    }

    @RequestMapping(value = { "/bao-hanh" }, method = RequestMethod.GET)
    public String baohanh() {
        return "user/baohanh";
    }

    @RequestMapping(value = { "/shop-detail" }, method = RequestMethod.GET)
    public String shopDetail() {
        return "user/shop-detail";
    }

    @RequestMapping(value = { "/category-detail" }, method = RequestMethod.GET)
    public String categoryDetail() {
        return "user/category-detail";
    }

}
