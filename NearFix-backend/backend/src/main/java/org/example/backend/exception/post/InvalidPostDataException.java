package org.example.backend.exception.post;

public class InvalidPostDataException extends PostException {
    public InvalidPostDataException(String message) {
        super("Invalid post data: " + message);
    }
} 