package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "Vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "vehicle_id")
    private UUID vehicleId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "vin", nullable = false, length = 50)
    private String vin;

    @Column(name = "brand", nullable = false, length = 50)
    private String brand;

    @Column(name = "model", nullable = false, length = 50)
    private String model;

    @Column(name = "year", nullable = false)
    private Integer year;

    @Column(name = "cylinder_capacity", nullable = false)
    private Integer cylinderCapacity;

    @Column(name = "power", nullable = false)
    private Integer power;

    @Enumerated(EnumType.STRING)
    @Column(name = "fuel_type", nullable = false, length = 50)
    private FuelType fuelType;

    @Column(name = "mileage", nullable = false)
    private Integer mileage;

    @Column(name = "photo_url", length = 1000)
    private String photoUrl;

    @OneToMany(mappedBy = "vehicle")
    private List<Appointment> appointments;
} 