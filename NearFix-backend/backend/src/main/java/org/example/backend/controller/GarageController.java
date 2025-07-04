package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.employee.EmployeeResponse;
import org.example.backend.dto.garage.GarageRequest;
import org.example.backend.dto.garage.GarageResponse;
import org.example.backend.dto.garage.GarageSearchRequest;
import org.example.backend.dto.appointment.AppointmentCreateRequest;
import org.example.backend.dto.appointment.AppointmentResponse;
import org.example.backend.entity.Appointment;
import org.example.backend.service.EmployeeService;
import org.example.backend.service.GarageService;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/garages")
@RequiredArgsConstructor
public class GarageController {
    private final GarageService garageService;
    private final EmployeeService employeeService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<GarageResponse> createGarage(
            @RequestPart("garageData") GarageRequest request,
            @RequestPart(value = "photo", required = false) MultipartFile photo,
            @RequestPart(value = "document", required = false) MultipartFile document,
            Authentication authentication) throws IOException {
        request.setPhoto(photo);
        request.setDocument(document);
        return ResponseEntity.ok(garageService.createGarage(request, authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<List<GarageResponse>> getUserGarages(Authentication authentication) {
        return ResponseEntity.ok(garageService.getUserGarages(authentication.getName()));
    }

    @GetMapping("/{garageId}")
    public ResponseEntity<GarageResponse> getGarage(@PathVariable UUID garageId) {
        return ResponseEntity.ok(garageService.getGarage(garageId));
    }

    @GetMapping("/{garageId}/employees")
    public ResponseEntity<List<EmployeeResponse>> getGarageEmployees(@PathVariable UUID garageId) {
        return ResponseEntity.ok(employeeService.getEmployeesByGarage(garageId));
    }

    @PutMapping(value = "/{garageId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<GarageResponse> updateGarage(
            @PathVariable UUID garageId,
            @RequestPart("garageData") GarageRequest request,
            @RequestPart(value = "photo", required = false) MultipartFile photo,
            @RequestPart(value = "document", required = false) MultipartFile document,
            Authentication authentication) throws IOException {
        request.setPhoto(photo);
        request.setDocument(document);
        return ResponseEntity.ok(garageService.updateGarage(garageId, request, authentication.getName()));
    }

    @DeleteMapping("/{garageId}")
    public ResponseEntity<Void> deleteGarage(
            @PathVariable UUID garageId,
            Authentication authentication) {
        garageService.deleteGarage(garageId, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{garageId}/photo")
    public ResponseEntity<Void> deleteGaragePhoto(
            @PathVariable UUID garageId,
            Authentication authentication) {
        garageService.deleteGaragePhoto(garageId, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{garageId}/document")
    public ResponseEntity<Void> deleteGarageDocument(
            @PathVariable UUID garageId,
            Authentication authentication) {
        garageService.deleteGarageDocument(garageId, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/search")
    public ResponseEntity<Page<GarageResponse>> searchGarages(@RequestBody GarageSearchRequest request) {
        return ResponseEntity.ok(garageService.searchGarages(request));
    }

    @PostMapping("/appointments")
    public ResponseEntity<AppointmentResponse> createAppointment(@RequestBody AppointmentCreateRequest request, Authentication authentication) {
        Appointment appointment = garageService.createAppointment(request, authentication.getName());
        AppointmentResponse response = garageService.mapToAppointmentResponse(appointment);
        return ResponseEntity.ok(response);
    }
}