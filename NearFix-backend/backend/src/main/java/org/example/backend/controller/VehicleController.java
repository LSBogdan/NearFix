package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.vehicle.VehicleRequest;
import org.example.backend.dto.vehicle.VehicleResponse;
import org.example.backend.dto.appointment.AppointmentResponse;
import org.example.backend.service.VehicleService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {
    private final VehicleService vehicleService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VehicleResponse> createVehicle(
            @RequestPart("vehicleData") VehicleRequest request,
            @RequestPart(value = "photo", required = false) MultipartFile photo,
            Authentication authentication) throws IOException {
        request.setPhoto(photo);
        return ResponseEntity.ok(vehicleService.createVehicle(request, authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<List<VehicleResponse>> getUserVehicles(Authentication authentication) {
        return ResponseEntity.ok(vehicleService.getUserVehicles(authentication.getName()));
    }

    @GetMapping("/{vehicleId}")
    public ResponseEntity<VehicleResponse> getVehicle(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(vehicleService.getVehicle(vehicleId));
    }

    @PutMapping(value = "/{vehicleId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VehicleResponse> updateVehicle(
            @PathVariable UUID vehicleId,
            @RequestPart("vehicleData") VehicleRequest request,
            @RequestPart(value = "photo", required = false) MultipartFile photo,
            Authentication authentication) throws IOException {
        request.setPhoto(photo);
        return ResponseEntity.ok(vehicleService.updateVehicle(vehicleId, request, authentication.getName()));
    }

    @DeleteMapping("/{vehicleId}")
    public ResponseEntity<Void> deleteVehicle(
            @PathVariable UUID vehicleId,
            Authentication authentication) {
        vehicleService.deleteVehicle(vehicleId, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{vehicleId}/photo")
    public ResponseEntity<Void> deleteVehiclePhoto(
            @PathVariable UUID vehicleId,
            Authentication authentication) {
        vehicleService.deleteVehiclePhoto(vehicleId, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{vehicleId}/appointments/completed")
    public ResponseEntity<List<AppointmentResponse>> getCompletedAppointmentsForVehicle(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(vehicleService.getCompletedAppointmentsForVehicle(vehicleId));
    }
} 