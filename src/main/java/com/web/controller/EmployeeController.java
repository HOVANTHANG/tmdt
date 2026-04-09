package com.web.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
@RequestMapping("/employee")
public class EmployeeController {

    @RequestMapping(value = {"/invoice"}, method = RequestMethod.GET)
    public String invoice() {
        return "employee/invoice";
    }

    @RequestMapping(value = {"/addimportproduct"}, method = RequestMethod.GET)
    public String addimportproduct() {
        return "employee/addimportproduct";
    }

    @RequestMapping(value = {"/importproduct"}, method = RequestMethod.GET)
    public String importproduct() {
        return "employee/importproduct";
    }

    @RequestMapping(value = {"/chat"}, method = RequestMethod.GET)
    public String chat() {
        return "employee/chat";
    }
}
