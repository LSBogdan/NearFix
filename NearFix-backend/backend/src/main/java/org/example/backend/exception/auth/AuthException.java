package org.example.backend.exception.auth;

public class AuthException extends RuntimeException {
    public AuthException(String message) {
        super(message);
    }
} 