package org.example.backend.dto.auth;

import lombok.Data;
import org.example.backend.entity.Role;
import org.springframework.web.multipart.MultipartFile;

@Data
public class RegisterRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String phoneNumber;
    private Role role;
    private AddressRequest address;
    private MultipartFile profilePhoto;
} 