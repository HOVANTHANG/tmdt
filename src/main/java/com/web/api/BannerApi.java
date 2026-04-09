package com.web.api;

import com.web.entity.Banner;
import com.web.entity.Category;
import com.web.enums.CategoryType;
import com.web.servive.BannerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/banner")
@CrossOrigin
public class BannerApi {

    @Autowired
    private BannerService bannerService;

    @GetMapping("/public/search")
    public ResponseEntity<?> search(@RequestParam("q") String search, Pageable pageable){
        Page<Banner> banners = bannerService.search(search,pageable);
        return new ResponseEntity<>(banners,HttpStatus.OK);
    }

    @GetMapping("/public/find-by-page")
    public ResponseEntity<?> findByType(@RequestParam(value = "page") String page){
        List<Banner> banners = bannerService.findByPageName(page);
        return new ResponseEntity<>(banners,HttpStatus.OK);
    }

    @PostMapping("/admin/create")
    public ResponseEntity<?> save(@RequestBody Banner banner){
        Banner result = bannerService.save(banner);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @PostMapping("/admin/update")
    public ResponseEntity<?> update(@RequestBody Banner banner){
        Banner result = bannerService.update(banner);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }


    @DeleteMapping("/admin/delete")
    public ResponseEntity<?> delete(@RequestParam("id") Long id){
        bannerService.delete(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/admin/findById")
    public ResponseEntity<?> findById(@RequestParam("id") Long id){
        Banner result = bannerService.findById(id);
        return new ResponseEntity<>(result,HttpStatus.OK);
    }
}
