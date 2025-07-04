package org.example.backend.exception.vehicle;

import java.util.UUID;

public class VehicleNotFoundException extends VehicleException {
    public VehicleNotFoundException(UUID vehicleId) {
        super("Vehicle not found with id: " + vehicleId);
    }
} 