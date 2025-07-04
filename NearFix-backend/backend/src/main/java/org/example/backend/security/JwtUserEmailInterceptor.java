package org.example.backend.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtUserEmailInterceptor implements HandlerInterceptor {

    private final JwtTokenUtil jwtTokenUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String authHeader = request.getHeader("Authorization");
        log.debug("Processing request to: {}", request.getRequestURI());
        log.debug("Authorization header: {}", authHeader);
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Missing or invalid Authorization header: {}", authHeader);
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("Missing or invalid Authorization header");
            return false;
        }

        try {
            String jwt = authHeader.substring(7);
            log.debug("Extracted JWT token: {}", jwt);
            String userEmail = jwtTokenUtil.extractUsername(jwt);
            log.debug("Extracted user email: {}", userEmail);
            
            if (userEmail != null) {
                request.setAttribute("userEmail", userEmail);
                return true;
            }
        } catch (Exception e) {
            log.error("Error processing JWT token", e);
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("Invalid JWT token: " + e.getMessage());
            return false;
        }

        log.warn("Failed to extract user email from token");
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.getWriter().write("Invalid JWT token");
        return false;
    }
} 