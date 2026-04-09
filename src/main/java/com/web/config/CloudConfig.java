package com.web.config;


import com.cloudinary.Cloudinary;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
@SpringBootApplication
public class CloudConfig {

    @Bean
    public Cloudinary cloudinaryConfigs() {
        Cloudinary cloudinary = null;
        Map config = new HashMap();
        config.put("cloud_name", "dkc0ky8md");
        config.put("api_key", "992598811475483");
        config.put("api_secret", "O8a9j2DPPyCV6hAUlBzc1cWpXRQ");
        cloudinary = new Cloudinary(config);
        return cloudinary;
    }

}
