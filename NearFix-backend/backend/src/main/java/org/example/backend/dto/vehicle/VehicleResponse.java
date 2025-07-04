package org.example.backend.dto.vehicle;

import lombok.Builder;
import lombok.Data;
import org.example.backend.entity.FuelType;

import java.util.UUID;

@Data
@Builder
public class VehicleResponse {
    private UUID vehicleId;
    private String vin;
    private String brand;
    private String model;
    private Integer year;
    private Integer cylinderCapacity;
    private Integer power;
    private FuelType fuelType;
    private Integer mileage;
    private UUID userId;
    private String photoUrl;
} 