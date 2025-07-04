package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.auth.AuthResponse;
import org.example.backend.dto.auth.LoginRequest;
import org.example.backend.dto.auth.RefreshTokenRequest;
import org.example.backend.dto.auth.RegisterRequest;
import org.example.backend.service.AuthService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AuthResponse> register(
            @RequestPart("userData") RegisterRequest request,
            @RequestPart(value = "profilePhoto", required = false) MultipartFile profilePhoto) throws IOException {
        request.setProfilePhoto(profilePhoto);
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @PutMapping(value = "/profile/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> updateProfilePhoto(
            @RequestParam("photo") MultipartFile photo,
            @RequestAttribute("userEmail") String userEmail) throws IOException {
        String newPhotoUrl = authService.updateProfilePhoto(photo, userEmail);
        return ResponseEntity.ok(Map.of("photoUrl", newPhotoUrl));
    }

    @DeleteMapping("/profile/photo")
    public ResponseEntity<Void> deleteProfilePhoto(@RequestAttribute("userEmail") String userEmail) {
        authService.deleteProfilePhoto(userEmail);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/profile/photo/refresh")
    public ResponseEntity<Map<String, String>> refreshProfilePhotoUrl(@RequestAttribute("userEmail") String userEmail) {
        String newPhotoUrl = authService.refreshProfilePhotoUrl(userEmail);
        if (newPhotoUrl == null) {
            return ResponseEntity.ok(Map.of("photoUrl", ""));
        }
        return ResponseEntity.ok(Map.of("photoUrl", newPhotoUrl));
    }
} 