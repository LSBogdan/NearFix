package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {
    @Id
    @OneToOne
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @Column(name = "rating", nullable = false)
    private Double rating;

    @Column(name = "details", nullable = false, length = 250)
    private String details;
} 