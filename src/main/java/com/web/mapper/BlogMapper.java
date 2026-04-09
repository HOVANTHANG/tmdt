package com.web.mapper;


import com.web.dto.request.BlogRequest;
import com.web.dto.response.BlogResponse;
import com.web.entity.Blog;
import com.web.entity.Category;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class BlogMapper {

    @Autowired
    private ModelMapper mapper;

    @Autowired
    private UserMapper userMapper;

    public Blog requestToBlog(BlogRequest request){
        Blog blog = mapper.map(request, Blog.class);
        return blog;
    }

    public BlogResponse blogToResponse(Blog blog){
        BlogResponse response = mapper.map(blog, BlogResponse.class);
        response.setUser(userMapper.userToUserDto(blog.getUser()));
        return response;
    }

    public BlogResponse blogToResponseD2(Blog blog){
        BlogResponse response = new BlogResponse();
        response.setContent(blog.getContent());
        response.setCreatedDate(blog.getCreatedDate());
        return response;
    }

    public List<BlogResponse> listBlogToResponse(List<Blog> list){
        List<BlogResponse> result = new ArrayList<>();
        for(Blog b: list){
            result.add(blogToResponse(b));
        }
        return result;
    }
}
