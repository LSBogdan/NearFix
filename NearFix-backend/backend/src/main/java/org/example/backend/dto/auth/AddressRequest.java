package org.example.backend.dto.auth;

import lombok.Data;

@Data
public class AddressRequest {
    // AddressRequest include: country, city, street, number, zipCode, latitude, longitude
    private String country;
    private String city;
    private String street;
    private Integer number;
    private Integer zipCode;
    private Double latitude;
    private Double longitude;
} 