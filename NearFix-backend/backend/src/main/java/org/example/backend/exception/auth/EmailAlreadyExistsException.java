package org.example.backend.exception.auth;

public class EmailAlreadyExistsException extends AuthException {
    public EmailAlreadyExistsException() {
        super("Email already exists");
    }
} 