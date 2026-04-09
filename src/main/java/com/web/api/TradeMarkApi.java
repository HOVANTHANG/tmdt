package com.web.api;
import com.web.entity.Category;
import com.web.entity.TradeMark;
import com.web.servive.CategoryService;
import com.web.servive.TradeMarkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trademark")
@CrossOrigin
public class TradeMarkApi {

    @Autowired
    private TradeMarkService tradeMarkService;


    @GetMapping("/public/findAll")
    public ResponseEntity<?> findAll(){
        List<TradeMark> tradeMarks = tradeMarkService.findAllList();
        return new ResponseEntity<>(tradeMarks, HttpStatus.OK);
    }

    @GetMapping("/public/search")
    public ResponseEntity<?> search(@RequestParam("q") String search,Pageable pageable){
        Page<TradeMark> result = tradeMarkService.search(search,pageable);
        return new ResponseEntity<>(result,HttpStatus.OK);
    }

    @PostMapping("/admin/create")
    public ResponseEntity<?> save(@RequestBody TradeMark tradeMark){
        TradeMark result = tradeMarkService.save(tradeMark);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @PostMapping("/admin/update")
    public ResponseEntity<?> update(@RequestBody TradeMark tradeMark){
        TradeMark result = tradeMarkService.update(tradeMark);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }


    @DeleteMapping("/admin/delete")
    public ResponseEntity<?> delete(@RequestParam("id") Long id){
        tradeMarkService.delete(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/admin/findById")
    public ResponseEntity<?> findById(@RequestParam("id") Long id){
        TradeMark result = tradeMarkService.findById(id);
        return new ResponseEntity<>(result,HttpStatus.OK);
    }

}
