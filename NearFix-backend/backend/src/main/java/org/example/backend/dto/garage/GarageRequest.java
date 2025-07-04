package org.example.backend.dto.garage;

import lombok.Data;
import org.example.backend.dto.auth.AddressRequest;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Data
public class GarageRequest {
    private String name;
    private AddressRequest address;
    private MultipartFile photo;
    private MultipartFile document;
    private List<GarageScheduleRequest> schedule;
}