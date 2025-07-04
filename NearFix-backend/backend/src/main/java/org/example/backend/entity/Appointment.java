package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "Appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "appointment_id")
    private UUID appointmentId;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "garage_id", nullable = false)
    private Garage garage;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User employee;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private AppointmentStatus status;

    @Column(name = "details", nullable = false, length = 250)
    private String details;

    @Column(name = "selected_date", nullable = false)
    private LocalDate selectedDate;

    @OneToMany(mappedBy = "appointment")
    private List<AppointmentOperation> appointmentOperations;

    @OneToOne(mappedBy = "appointment")
    private Review review;
} 