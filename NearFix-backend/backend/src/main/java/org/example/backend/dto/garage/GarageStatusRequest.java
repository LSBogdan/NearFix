package org.example.backend.dto.garage;

import lombok.Data;
import org.example.backend.entity.GarageStatus;

@Data
public class GarageStatusRequest {
    private GarageStatus status;
    private String rejectionReason;
}
