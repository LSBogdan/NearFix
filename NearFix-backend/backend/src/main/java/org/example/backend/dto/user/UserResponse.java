package org.example.backend.dto.user;

import lombok.Builder;
import lombok.Data;
import org.example.backend.entity.Role;

import java.util.UUID;

@Data
@Builder
public class UserResponse {
    private UUID userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String profilePhotoUrl;
    private Role role;
    private AddressResponse address;
}