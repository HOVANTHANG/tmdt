package com.web.serviceImp;

import com.web.dto.request.CommentRequest;
import com.web.dto.response.ProductCommentResponse;
import com.web.entity.Product;
import com.web.entity.ProductComment;
import com.web.entity.ProductCommentImage;
import com.web.exception.MessageException;
import com.web.mapper.ProductCommentMapper;
import com.web.repository.ProductCommentImageRepository;
import com.web.repository.ProductCommentRepository;
import com.web.servive.ProductCommentService;
import com.web.utils.UserUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.sql.Date;
import java.sql.Time;
import java.util.List;
import java.util.Optional;

@Component
public class ProductCommentServiceImp implements ProductCommentService {

    @Autowired
    private ProductCommentRepository productCommentRepository;

    @Autowired
    private ProductCommentMapper productCommentMapper;

    @Autowired
    private ProductCommentImageRepository productCommentImageRepository;

    @Autowired
    private UserUtils userUtils;

    @Override
    public ProductCommentResponse create(CommentRequest commentRequest) {
        if(commentRequest.getId() != null){
           throw new MessageException("id must null");
        }
        ProductComment productComment = productCommentMapper.productCmtRequestToProductComment(commentRequest);
        productComment.setCreatedDate(new Date(System.currentTimeMillis()));
        productComment.setCreatedTime(new Time(System.currentTimeMillis()));
        productComment.setUser(userUtils.getUserWithAuthority());
        ProductComment result = productCommentRepository.save(productComment);
        for(String s : commentRequest.getListLink()){
            ProductCommentImage image = new ProductCommentImage();
            image.setProductComment(result);
            image.setLinkImage(s);
            productCommentImageRepository.save(image);
        }
        ProductCommentResponse response = productCommentMapper.productCmtToProductCommentRes(result);
        response.setIsMyComment(true);
        return response;
    }

    @Override
    public ProductCommentResponse update(CommentRequest commentRequest) {
        if(commentRequest.getId() == null){
            throw new MessageException("id require");
        }
        Optional<ProductComment> optional = productCommentRepository.findById(commentRequest.getId());
        if(optional.isEmpty()){
            throw new MessageException("comment not found");
        }
        if(optional.get().getUser().getId() != userUtils.getUserWithAuthority().getId()){
            throw new MessageException("access denied");
        }
        ProductComment productComment = productCommentMapper.productCmtRequestToProductComment(commentRequest);
        productComment.setCreatedDate(new Date(System.currentTimeMillis()));
        productComment.setCreatedTime(new Time(System.currentTimeMillis()));
        productComment.setUser(userUtils.getUserWithAuthority());
        productComment.setProduct(optional.get().getProduct());

        ProductComment result = productCommentRepository.save(productComment);
        for(String s : commentRequest.getListLink()){
            ProductCommentImage image = new ProductCommentImage();
            image.setProductComment(result);
            image.setLinkImage(s);
            productCommentImageRepository.save(image);
        }
        ProductCommentResponse response = productCommentMapper.productCmtToProductCommentRes(result);
        response.setIsMyComment(true);
        return response;
    }

    @Override
    public void delete(Long id) {
        if(id == null){
            throw new MessageException("id require");
        }
        Optional<ProductComment> optional = productCommentRepository.findById(id);
        if(optional.isEmpty()){
            throw new MessageException("comment not found");
        }
        if(optional.get().getUser().getId() != userUtils.getUserWithAuthority().getId()){
            throw new MessageException("access denied");
        }
        productCommentRepository.deleteById(id);
    }

    @Override
    public void deleteByAdmin(Long id) {
        productCommentRepository.deleteById(id);
    }

    @Override
    public ProductCommentResponse findById(Long productId) {
        if(productId == null){
            throw new MessageException("id require");
        }
        Optional<ProductComment> optional = productCommentRepository.findById(productId);
        if(optional.isEmpty()){
            throw new MessageException("comment not found");
        }
        if(optional.get().getUser().getId() != userUtils.getUserWithAuthority().getId()){
            throw new MessageException("access denied");
        }
        return productCommentMapper.productCmtToProductCommentRes(optional.get());
    }

    @Override
    public List<ProductCommentResponse> findByProductId(Long productId) {
        List<ProductComment> list = productCommentRepository.findByProductId(productId);
        List<ProductCommentResponse> responses = productCommentMapper.listProductCmtToProCommentResponse(list);
        return responses;
    }
}
