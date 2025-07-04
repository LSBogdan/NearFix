package org.example.backend.exception.vehicle;

public class InvalidVehicleDataException extends VehicleException {
    public InvalidVehicleDataException(String message) {
        super("Invalid vehicle data: " + message);
    }
} 