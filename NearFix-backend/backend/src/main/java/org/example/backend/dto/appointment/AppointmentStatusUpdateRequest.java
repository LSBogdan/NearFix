package org.example.backend.dto.appointment;

import lombok.Data;
import org.example.backend.entity.AppointmentStatus;

import java.util.UUID;

@Data
public class AppointmentStatusUpdateRequest {
    private UUID appointmentId;
    private AppointmentStatus status;
} 