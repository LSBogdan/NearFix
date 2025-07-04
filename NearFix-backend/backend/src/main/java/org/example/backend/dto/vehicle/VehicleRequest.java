package org.example.backend.dto.vehicle;

import lombok.Data;
import org.example.backend.entity.FuelType;
import org.springframework.web.multipart.MultipartFile;

@Data
public class VehicleRequest {
    private String vin;
    private String brand;
    private String model;
    private Integer year;
    private Integer cylinderCapacity;
    private Integer power;
    private FuelType fuelType;
    private Integer mileage;
    private MultipartFile photo;
} 