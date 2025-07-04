package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.user.UserResponse;
import org.example.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.example.backend.entity.Appointment;
import org.example.backend.dto.appointment.AppointmentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.example.backend.dto.user.UserUpdateRequest;
import org.example.backend.dto.user.ChangePasswordRequest;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(userService.getUserByEmail(authentication.getName()));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    @GetMapping("/appointments")
    public ResponseEntity<Page<AppointmentResponse>> getMyAppointments(Authentication authentication, Pageable pageable) {
        Page<AppointmentResponse> responses = userService.getMyAppointmentsPaginated(authentication.getName(), pageable);
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(@RequestBody UserUpdateRequest request, Authentication authentication) {
        return ResponseEntity.ok(userService.updateUserProfile(authentication.getName(), request));
    }

    @PutMapping("/profile/password")
    public ResponseEntity<Void> changePassword(@RequestBody ChangePasswordRequest request, Authentication authentication) {
        userService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok().build();
    }
} 