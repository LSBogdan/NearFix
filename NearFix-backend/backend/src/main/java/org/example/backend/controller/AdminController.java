package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.garage.GarageResponse;
import org.example.backend.dto.garage.GarageStatusRequest;
import org.example.backend.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/garages")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/pending")
    public ResponseEntity<List<GarageResponse>> getPendingGarages() {
        return ResponseEntity.ok(adminService.getPendingGarages());
    }

    @PutMapping("/{garageId}/status")
    public ResponseEntity<GarageResponse> updateGarageStatus(
            @PathVariable UUID garageId,
            @RequestBody GarageStatusRequest request) {
        return ResponseEntity.ok(adminService.updateGarageStatus(garageId, request));
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<Map<String, Long>> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }
}
