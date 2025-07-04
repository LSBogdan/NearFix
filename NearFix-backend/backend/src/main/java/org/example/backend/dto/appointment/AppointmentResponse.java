package org.example.backend.dto.appointment;

import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class AppointmentResponse {
    private UUID appointmentId;
    private UUID garageId;
    private UUID vehicleId;
    private UUID employeeId;
    private String status;
    private String details;
    private LocalDate selectedDate;
    private String garagePhotoUrl;
    private String garageName;
    private String employeeName;
    private String employeeEmail;
    private String employeePhoneNumber;
    private String area;
    private String vehicleBrand;
    private String vehicleModel;
    private String vehicleVin;
    private String vehicleOwnerName;
    private String vehicleOwnerEmail;
    private String vehicleOwnerPhoneNumber;
} 