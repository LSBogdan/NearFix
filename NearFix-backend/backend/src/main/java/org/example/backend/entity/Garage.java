package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "Garages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Garage {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "garage_id")
    private UUID garageId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "address_id", nullable = false)
    private Address address;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "photo_url", nullable = true, length = 1000)
    private String photoUrl;

    @Column(name = "document_url", nullable = true, length = 1000)
    private String documentUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private GarageStatus status = GarageStatus.PENDING;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @OneToMany(mappedBy = "garage", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GarageSchedule> schedule = new ArrayList<>();

    @OneToMany(mappedBy = "garage")
    private List<GarageOperation> garageOperations;

    @OneToMany(mappedBy = "garage")
    private List<Appointment> appointments;

    @OneToMany(mappedBy = "garage")
    private List<Announcement> announcements;
}