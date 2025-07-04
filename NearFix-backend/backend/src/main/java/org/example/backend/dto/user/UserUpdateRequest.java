package org.example.backend.dto.user;

import lombok.Data;
import org.example.backend.dto.auth.AddressRequest;

@Data
public class UserUpdateRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private AddressRequest address;
} 