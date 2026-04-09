package com.web;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class PhoneStoreApplication {

    public static void main(String[] args) {
        SpringApplication.run(PhoneStoreApplication.class, args);
    }

}
