package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.vehicle.VehicleRequest;
import org.example.backend.dto.vehicle.VehicleResponse;
import org.example.backend.entity.User;
import org.example.backend.entity.Vehicle;
import org.example.backend.exception.user.UserNotFoundException;
import org.example.backend.exception.vehicle.InvalidVehicleDataException;
import org.example.backend.exception.vehicle.VehicleNotFoundException;
import org.example.backend.repository.UserRepository;
import org.example.backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.example.backend.entity.AppointmentStatus;
import org.example.backend.dto.appointment.AppointmentResponse;
import org.example.backend.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.stream.Collectors;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VehicleService {
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service;
    @Autowired
    private AppointmentRepository appointmentRepository;
    @Autowired
    private UserService userService;

    @Transactional
    public VehicleResponse createVehicle(VehicleRequest request, String userEmail) throws IOException {
        validateVehicleRequest(request);

        if (vehicleRepository.existsByVin(request.getVin())) {
            throw new InvalidVehicleDataException("A vehicle with this VIN already exists");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        Vehicle vehicle = new Vehicle();
        vehicle.setVin(request.getVin());
        vehicle.setBrand(request.getBrand());
        vehicle.setModel(request.getModel());
        vehicle.setYear(request.getYear());
        vehicle.setCylinderCapacity(request.getCylinderCapacity());
        vehicle.setPower(request.getPower());
        vehicle.setFuelType(request.getFuelType());
        vehicle.setMileage(request.getMileage());
        vehicle.setUser(user);

        vehicle = vehicleRepository.save(vehicle);

        // Handle photo upload if provided
        if (request.getPhoto() != null && !request.getPhoto().isEmpty()) {
            String photoUrl = s3Service.uploadVehiclePhoto(request.getPhoto(), vehicle.getVehicleId());
            vehicle.setPhotoUrl(photoUrl);
            vehicle = vehicleRepository.save(vehicle);
        }

        return mapToVehicleResponse(vehicle);
    }

    public List<VehicleResponse> getUserVehicles(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        return vehicleRepository.findByUser_UserId(user.getUserId())
                .stream()
                .map(this::mapToVehicleResponse)
                .collect(Collectors.toList());
    }

    public VehicleResponse getVehicle(UUID vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new VehicleNotFoundException(vehicleId));
        return mapToVehicleResponse(vehicle);
    }

    @Transactional
    public VehicleResponse updateVehicle(UUID vehicleId, VehicleRequest request, String userEmail) throws IOException {
        validateVehicleRequest(request);

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new VehicleNotFoundException(vehicleId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        if (!vehicle.getUser().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("You don't have permission to update this vehicle");
        }

        vehicle.setVin(request.getVin());
        vehicle.setBrand(request.getBrand());
        vehicle.setModel(request.getModel());
        vehicle.setYear(request.getYear());
        vehicle.setCylinderCapacity(request.getCylinderCapacity());
        vehicle.setPower(request.getPower());
        vehicle.setFuelType(request.getFuelType());
        vehicle.setMileage(request.getMileage());

        // Handle photo upload if provided
        if (request.getPhoto() != null && !request.getPhoto().isEmpty()) {
            String photoUrl = s3Service.updateVehiclePhoto(request.getPhoto(), vehicle.getVehicleId());
            vehicle.setPhotoUrl(photoUrl);
        }

        vehicle = vehicleRepository.save(vehicle);
        return mapToVehicleResponse(vehicle);
    }

    @Transactional
    public void deleteVehicle(UUID vehicleId, String userEmail) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new VehicleNotFoundException(vehicleId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        if (!vehicle.getUser().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("You don't have permission to delete this vehicle");
        }

        // Delete the vehicle photo from S3 if it exists
        s3Service.deleteVehiclePhoto(vehicleId);
        
        vehicleRepository.delete(vehicle);
    }

    @Transactional
    public void deleteVehiclePhoto(UUID vehicleId, String userEmail) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new VehicleNotFoundException(vehicleId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        if (!vehicle.getUser().getUserId().equals(user.getUserId())) {
            throw new InvalidVehicleDataException("You don't have permission to delete this vehicle's photo");
        }

        // Only proceed if the vehicle has a photo
        if (vehicle.getPhotoUrl() != null) {
            // Delete the photo from S3
            s3Service.deleteVehiclePhoto(vehicleId);
            
            // Update the vehicle's photo URL to null
            vehicle.setPhotoUrl(null);
            vehicleRepository.save(vehicle);
        }
    }

    private void validateVehicleRequest(VehicleRequest request) {
        if (request.getVin() == null || request.getVin().trim().isEmpty()) {
            throw new InvalidVehicleDataException("VIN cannot be empty");
        }
        if (request.getBrand() == null || request.getBrand().trim().isEmpty()) {
            throw new InvalidVehicleDataException("Brand cannot be empty");
        }
        if (request.getModel() == null || request.getModel().trim().isEmpty()) {
            throw new InvalidVehicleDataException("Model cannot be empty");
        }
        if (request.getYear() == null || request.getYear() < 1900 || request.getYear() > 2100) {
            throw new InvalidVehicleDataException("Invalid year");
        }
        if (request.getCylinderCapacity() == null || request.getCylinderCapacity() <= 0) {
            throw new InvalidVehicleDataException("Invalid cylinder capacity");
        }
        if (request.getPower() == null || request.getPower() <= 0) {
            throw new InvalidVehicleDataException("Invalid power");
        }
        if (request.getFuelType() == null) {
            throw new InvalidVehicleDataException("Fuel type cannot be empty");
        }
        if (request.getMileage() == null || request.getMileage() < 0) {
            throw new InvalidVehicleDataException("Invalid mileage");
        }
    }

    private VehicleResponse mapToVehicleResponse(Vehicle vehicle) {
        return VehicleResponse.builder()
                .vehicleId(vehicle.getVehicleId())
                .vin(vehicle.getVin())
                .brand(vehicle.getBrand())
                .model(vehicle.getModel())
                .year(vehicle.getYear())
                .cylinderCapacity(vehicle.getCylinderCapacity())
                .power(vehicle.getPower())
                .fuelType(vehicle.getFuelType())
                .mileage(vehicle.getMileage())
                .userId(vehicle.getUser().getUserId())
                .photoUrl(vehicle.getPhotoUrl())
                .build();
    }

    public List<AppointmentResponse> getCompletedAppointmentsForVehicle(UUID vehicleId) {
        return appointmentRepository.findByVehicle_VehicleIdAndStatus(vehicleId, AppointmentStatus.COMPLETED)
            .stream()
            .map(userService::mapToAppointmentResponse)
            .collect(Collectors.toList());
    }
} 