package org.example.backend.dto.garage;

import lombok.Builder;
import lombok.Data;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
public class GarageScheduleResponse {
    private UUID scheduleId;
    // dayOfWeek: 0 = Monday, 6 = Sunday
    private Integer dayOfWeek;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private Boolean isClosed;
} 