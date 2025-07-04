package org.example.backend.dto.garage;

import lombok.Builder;
import lombok.Data;
import org.example.backend.dto.user.AddressResponse;
import org.example.backend.entity.GarageStatus;

import java.util.UUID;
import java.util.List;

@Data
@Builder
public class GarageResponse {
    private UUID garageId;
    private String name;
    private UUID userId;
    private String ownerName;
    private String ownerEmail;
    private String ownerPhoneNumber;
    private String ownerProfilePhotoUrl;
    private AddressResponse address;
    private String photoUrl;
    private String documentUrl;
    private GarageStatus status;
    private String rejectionReason;
    // schedule: List<GarageScheduleResponse> where dayOfWeek is 0 = Monday, 6 = Sunday
    private List<GarageScheduleResponse> schedule;
}