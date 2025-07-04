package org.example.backend.dto.user;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class AddressResponse {
    // AddressResponse include: addressId, country, city, street, number, zipCode, latitude, longitude
    private UUID addressId;
    private String country;
    private String city;
    private String street;
    private Integer number;
    private Integer zipCode;
    private Double latitude;
    private Double longitude;
} 