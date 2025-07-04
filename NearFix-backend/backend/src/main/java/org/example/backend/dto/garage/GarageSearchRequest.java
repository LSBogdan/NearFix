package org.example.backend.dto.garage;

import lombok.Data;

@Data
public class GarageSearchRequest {
    private double latitude;
    private double longitude;
    private String area; // ex: "MECHANIC_ENGINE"
    private boolean openNow;
    private int page = 0;
    private int size = 10;
} 