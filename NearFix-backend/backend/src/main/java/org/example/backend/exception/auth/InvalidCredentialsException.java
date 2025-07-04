package org.example.backend.exception.auth;

public class InvalidCredentialsException extends AuthException {
    public InvalidCredentialsException() {
        super("Invalid email or password");
    }
} 