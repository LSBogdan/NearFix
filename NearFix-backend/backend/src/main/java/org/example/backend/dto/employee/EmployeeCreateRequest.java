package org.example.backend.dto.employee;

import lombok.Data;
import org.example.backend.dto.auth.AddressRequest;
import org.example.backend.entity.Role;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Data
public class EmployeeCreateRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private Role role;
    private AddressRequest address;
    private MultipartFile profilePhoto;
    private UUID garageId; // The garage where the employee will work
} 