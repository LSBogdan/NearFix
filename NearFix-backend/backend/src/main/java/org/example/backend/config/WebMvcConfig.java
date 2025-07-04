package org.example.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.security.JwtUserEmailInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final JwtUserEmailInterceptor jwtUserEmailInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        log.info("Registering JwtUserEmailInterceptor");
        registry.addInterceptor(jwtUserEmailInterceptor)
                .addPathPatterns("/api/auth/profile/**")
                .excludePathPatterns("/api/auth/login", "/api/auth/register", "/api/auth/refresh");
    }
} 