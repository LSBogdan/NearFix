package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "Operations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Operation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "operation_id")
    private UUID operationId;

    @Column(name = "title", nullable = false, length = 50)
    private String title;

    @Column(name = "description", nullable = false, length = 250)
    private String description;

    @OneToMany(mappedBy = "operation")
    private List<GarageOperation> garageOperations;

    @OneToMany(mappedBy = "operation")
    private List<AppointmentOperation> appointmentOperations;
} 