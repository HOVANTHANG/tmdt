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

}
