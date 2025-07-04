package org.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "Addresses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Address {
    // Address include: addressId, country, city, street, number, zipCode, latitude, longitude
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "address_id")
    private UUID addressId;

    @Column(name = "country", nullable = false, length = 50)
    private String country;

    @Column(name = "city", nullable = false, length = 50)
    private String city;

    @Column(name = "street", nullable = false, length = 50)
    private String street;

    @Column(name = "number", nullable = false)
    private Integer number;

    @Column(name = "zip_code", nullable = false)
    private Integer zipCode;

    @Column(name = "latitude", nullable = true)
    private Double latitude;

    @Column(name = "longitude", nullable = true)
    private Double longitude;

    @OneToMany(mappedBy = "address")
    private List<User> users;
} 