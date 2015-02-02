package org.ohdsi.heracles;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.context.web.SpringBootServletInitializer;

@SpringBootApplication
public class HeraclesApp extends SpringBootServletInitializer {
    
    @Override
    protected SpringApplicationBuilder configure(final SpringApplicationBuilder application) {
        return application.sources(HeraclesApp.class);
    }
    
    public static void main(final String[] args) throws Exception {
        new SpringApplicationBuilder(HeraclesApp.class).run(args);
    }
}