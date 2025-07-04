package org.example.backend.dto.garage;

import lombok.Data;
import java.time.LocalTime;

@Data
public class GarageScheduleRequest {
    private Integer dayOfWeek;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private Boolean isClosed;
} 