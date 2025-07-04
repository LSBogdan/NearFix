package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.employee.EmployeeCreateRequest;
import org.example.backend.dto.employee.EmployeeResponse;
import org.example.backend.dto.appointment.AppointmentStatusUpdateRequest;
import org.example.backend.dto.appointment.AppointmentResponse;
import org.example.backend.entity.Appointment;
import org.example.backend.service.EmployeeService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/garage-owner/employees")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('GARAGE_OWNER', 'MECHANIC_GENERAL', 'MECHANIC_WHEELS', 'MECHANIC_AC', 'MECHANIC_BODYWORK', 'MECHANIC_PAINT', 'MECHANIC_ELECTRIC', 'MECHANIC_ENGINE', 'MECHANIC_TRANSMISSION')")
public class GarageOwnerEmployeeController {

    private final EmployeeService employeeService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<EmployeeResponse> createEmployee(
            @RequestPart("employeeData") EmployeeCreateRequest request,
            @RequestPart(value = "profilePhoto", required = false) org.springframework.web.multipart.MultipartFile profilePhoto,
            Authentication authentication) throws IOException {
        request.setProfilePhoto(profilePhoto);
        return ResponseEntity.ok(employeeService.createEmployeeForGarageOwner(request, authentication.getName()));
    }

    @GetMapping("/garage/{garageId}")
    public ResponseEntity<List<EmployeeResponse>> getEmployeesByGarage(
            @PathVariable UUID garageId,
            Authentication authentication) {
        return ResponseEntity.ok(employeeService.getEmployeesByGarageForOwner(garageId, authentication.getName()));
    }

    @GetMapping("/{employeeId}")
    public ResponseEntity<EmployeeResponse> getEmployee(
            @PathVariable UUID employeeId,
            Authentication authentication) {
        return ResponseEntity.ok(employeeService.getEmployeeForOwner(employeeId, authentication.getName()));
    }

    @PutMapping(value = "/{employeeId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<EmployeeResponse> updateEmployee(
            @PathVariable UUID employeeId,
            @RequestPart("employeeData") EmployeeCreateRequest request,
            @RequestPart(value = "profilePhoto", required = false) org.springframework.web.multipart.MultipartFile profilePhoto,
            Authentication authentication) throws IOException {
        request.setProfilePhoto(profilePhoto);
        return ResponseEntity.ok(employeeService.updateEmployeeForOwner(employeeId, request, authentication.getName()));
    }

    @DeleteMapping("/{employeeId}")
    public ResponseEntity<Void> deleteEmployee(
            @PathVariable UUID employeeId,
            Authentication authentication) {
        employeeService.deleteEmployeeForOwner(employeeId, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/appointments/status")
    public ResponseEntity<AppointmentResponse> updateAppointmentStatus(@RequestBody AppointmentStatusUpdateRequest request, Authentication authentication) {
        Appointment appointment = employeeService.updateAppointmentStatus(request, authentication.getName());
        AppointmentResponse response = employeeService.mapToAppointmentResponse(appointment);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/appointments/assigned")
    public ResponseEntity<Page<AppointmentResponse>> getMyAppointments(Authentication authentication, Pageable pageable) {
        Page<AppointmentResponse> responses = employeeService.getMyAppointmentsPaginated(authentication.getName(), pageable);
        return ResponseEntity.ok(responses);
    }
} 