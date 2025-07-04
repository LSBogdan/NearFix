package org.example.backend.entity;

import jakarta.persistence.*;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "Garage_Schedules", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"garage_id", "day_of_week"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class 
GarageSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "schedule_id")
    private UUID scheduleId;

    @ManyToOne
    @JoinColumn(name = "garage_id", nullable = false)
    private Garage garage;

    @Column(name = "day_of_week", nullable = false)
    private Integer dayOfWeek; // 0 = Monday, 6 = Sunday

    @Column(name = "opening_time", nullable = false)
    private LocalTime openingTime;

    @Column(name = "closing_time", nullable = false)
    private LocalTime closingTime;

    @Column(name = "is_closed", nullable = false)
    private Boolean isClosed = false;
} 