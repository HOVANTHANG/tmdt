package com.web.ghn;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/shipping")
public class ShippingController {

    @Autowired
    private GhnClient ghnClient;


    @GetMapping("/tinh-phi")
    public Map<String, Object> calculateShippingFee(@RequestParam Integer toDistrictId, @RequestParam String toWardCode, @RequestParam Integer weight) {
        return ghnClient.calculateShippingFee(weight, toDistrictId,toWardCode);
    }

    @GetMapping("/public/province")
    public ResponseEntity<?> getProvince() {
        return new ResponseEntity<>(ghnClient.getProvince(), HttpStatus.OK);
    }

    @GetMapping("/public/district")
    public ResponseEntity<?> getDistrict(@RequestParam Integer provinceId) {
        return new ResponseEntity<>(ghnClient.getDistrict(provinceId), HttpStatus.OK);
    }

    @GetMapping("/public/wards")
    public ResponseEntity<?> getWard(@RequestParam Integer districtId) {
        return new ResponseEntity<>(ghnClient.getWard(districtId), HttpStatus.OK);
    }
}

