package org.ohdsi.heracles;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ComponentScan
@EnableAutoConfiguration
public class HeraclesApp {

    public static void main(String[] args) {
        SpringApplication.run(HeraclesApp.class, args);
    }

}
