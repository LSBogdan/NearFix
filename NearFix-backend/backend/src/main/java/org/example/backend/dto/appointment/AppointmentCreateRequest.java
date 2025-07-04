package org.example.backend.dto.appointment;

import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class AppointmentCreateRequest {
    private UUID garageId;
    private UUID vehicleId;
    private LocalDate selectedDate;
    private String details;
    private String area; // ex: "MECHANIC_ENGINE"
} 