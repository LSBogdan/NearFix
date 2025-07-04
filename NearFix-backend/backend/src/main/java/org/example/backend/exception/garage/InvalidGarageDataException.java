package org.example.backend.exception.garage;

public class InvalidGarageDataException extends RuntimeException {
    public InvalidGarageDataException(String message) {
        super("Invalid garage data: " + message);
    }
} 