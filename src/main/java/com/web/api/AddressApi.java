package com.web.api;

import com.web.entity.Districts;
import com.web.entity.Province;
import com.web.entity.Wards;
import com.web.repository.DistrictsRepository;
import com.web.repository.ProvinceRepository;
import com.web.repository.WardsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/address")
@CrossOrigin
public class AddressApi {

    @Autowired
    private ProvinceRepository provinceRepository;

    @Autowired
    private DistrictsRepository districtsRepository;

    @Autowired
    private WardsRepository wardsRepository;

    @GetMapping("/public/province")
    public List<Province> findAllProvince(){
        return provinceRepository.findAll();
    }

    @GetMapping("/public/wards-by-id")
    public Wards getWardsById(@RequestParam("id") Long id){
        return wardsRepository.findById(id).get();
    }
}
