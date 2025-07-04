package org.example.backend.exception.garage;

import java.util.UUID;

public class GarageNotFoundException extends RuntimeException {
    public GarageNotFoundException(UUID garageId) {
        super("Garage not found with id: " + garageId);
    }
} 