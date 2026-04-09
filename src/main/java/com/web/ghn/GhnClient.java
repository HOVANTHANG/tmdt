package com.web.ghn;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Service
public class GhnClient {

    @Value("${ghn.api.key}")
    private String apiKey;

    @Value("${ghn.shopId}")
    private String shopId;

    private final RestTemplate restTemplate;

    public GhnClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Map<String, Object> calculateShippingFee(Integer weight ,Integer toDistrictId, String toWardCode) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", apiKey);
        headers.set("shopId", shopId);
        headers.set("Content-Type", "application/json");

        Map<String, Object> shippingData = new HashMap<>();
        // nam từ liêm - hà nội
        shippingData.put("from_district_id", 3440);
        shippingData.put("from_ward_code", "13010");
        shippingData.put("to_district_id", toDistrictId);
        shippingData.put("to_ward_code", toWardCode);
        shippingData.put("weight", weight);
        shippingData.put("service_type_id", 2);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(shippingData, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee",
                HttpMethod.POST,
                request,
                Map.class
        );
        System.out.println(response.toString());
        return response.getBody();
    }


    public Map<String, Object> getProvince() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", apiKey);
        headers.set("Content-Type", "application/json");

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                "https://online-gateway.ghn.vn/shiip/public-api/master-data/province",
                HttpMethod.POST,
                request,
                Map.class
        );
        return response.getBody();
    }


    public Map<String, Object> getDistrict(Integer provinceId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", apiKey);
        headers.set("Content-Type", "application/json");
        Map<String, Object> data = new HashMap<>();
        data.put("province_id", provinceId);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(data,headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                "https://online-gateway.ghn.vn/shiip/public-api/master-data/district",
                HttpMethod.POST,
                request,
                Map.class
        );
        return response.getBody();
    }

    public Map<String, Object> getWard(Integer districtId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", apiKey);
        headers.set("Content-Type", "application/json");
        Map<String, Object> data = new HashMap<>();
        data.put("district_id", districtId);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(data,headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                "https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id",
                HttpMethod.POST,
                request,
                Map.class
        );
        return response.getBody();
    }
}
