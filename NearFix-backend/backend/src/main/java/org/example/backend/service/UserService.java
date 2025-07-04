package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.user.AddressResponse;
import org.example.backend.dto.user.UserResponse;
import org.example.backend.entity.User;
import org.example.backend.entity.Appointment;
import org.example.backend.exception.user.UserNotFoundException;
import org.example.backend.repository.UserRepository;
import org.example.backend.repository.AppointmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.example.backend.dto.appointment.AppointmentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.example.backend.dto.user.UserUpdateRequest;
import org.example.backend.dto.user.ChangePasswordRequest;
import org.example.backend.entity.Address;
import org.example.backend.repository.AddressRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.example.backend.exception.user.UserException;

import java.util.UUID;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final AddressRepository addressRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
        return mapToUserResponse(user);
    }

    public UserResponse getUserById(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        return mapToUserResponse(user);
    }

    @Transactional(readOnly = true)
    public List<Appointment> getMyAppointments(String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        return appointmentRepository.findByVehicle_User_UserId(customer.getUserId());
    }

    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getMyAppointmentsPaginated(String customerEmail, Pageable pageable) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        Pageable sortedPageable = org.springframework.data.domain.PageRequest.of(
            pageable.getPageNumber(),
            pageable.getPageSize(),
            pageable.getSort().and(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "selectedDate"))
        );
        Page<Appointment> appointments = appointmentRepository.findByVehicle_User_UserId(customer.getUserId(), sortedPageable);
        return appointments.map(this::mapToAppointmentResponse);
    }

    @Transactional
    public UserResponse updateUserProfile(String currentEmail, UserUpdateRequest request) {
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + currentEmail));
        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyUsedException();
        }
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        Address address = user.getAddress();
        address.setCountry(request.getAddress().getCountry());
        address.setCity(request.getAddress().getCity());
        address.setStreet(request.getAddress().getStreet());
        address.setNumber(request.getAddress().getNumber());
        address.setZipCode(request.getAddress().getZipCode());
        address.setLatitude(request.getAddress().getLatitude());
        address.setLongitude(request.getAddress().getLongitude());
        addressRepository.save(address);
        user.setAddress(address);
        user = userRepository.save(user);
        return mapToUserResponse(user);
    }

    @Transactional
    public void changePassword(String userEmail, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new IncorrectPasswordException();
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .profilePhotoUrl(user.getProfilePhotoUrl())
                .role(user.getRole())
                .address(AddressResponse.builder()
                        .addressId(user.getAddress().getAddressId())
                        .country(user.getAddress().getCountry())
                        .city(user.getAddress().getCity())
                        .street(user.getAddress().getStreet())
                        .number(user.getAddress().getNumber())
                        .zipCode(user.getAddress().getZipCode())
                        .latitude(user.getAddress().getLatitude())
                        .longitude(user.getAddress().getLongitude())
                        .build())
                .build();
    }

    public AppointmentResponse mapToAppointmentResponse(Appointment appointment) {
        AppointmentResponse dto = new AppointmentResponse();
        dto.setAppointmentId(appointment.getAppointmentId());
        dto.setGarageId(appointment.getGarage().getGarageId());
        dto.setVehicleId(appointment.getVehicle().getVehicleId());
        dto.setEmployeeId(appointment.getEmployee().getUserId());
        dto.setStatus(appointment.getStatus().name());
        dto.setDetails(appointment.getDetails());
        dto.setSelectedDate(appointment.getSelectedDate());
        dto.setGaragePhotoUrl(appointment.getGarage().getPhotoUrl());
        dto.setGarageName(appointment.getGarage().getName());
        User employee = appointment.getEmployee();
        dto.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());
        dto.setEmployeeEmail(employee.getEmail());
        dto.setEmployeePhoneNumber(employee.getPhoneNumber());
        String area = null;
        if (employee.getRole() != null) {
            switch (employee.getRole().name()) {
                case "MECHANIC_GENERAL": area = "General"; break;
                case "MECHANIC_WHEELS": area = "Wheels"; break;
                case "MECHANIC_AC": area = "A/C"; break;
                case "MECHANIC_BODYWORK": area = "Bodywork"; break;
                case "MECHANIC_PAINT": area = "Paint"; break;
                case "MECHANIC_ELECTRIC": area = "Electric"; break;
                case "MECHANIC_ENGINE": area = "Engine"; break;
                case "MECHANIC_TRANSMISSION": area = "Transmission"; break;
                default: area = employee.getRole().name(); break;
            }
        }
        dto.setArea(area);
        dto.setVehicleBrand(appointment.getVehicle().getBrand());
        dto.setVehicleModel(appointment.getVehicle().getModel());
        dto.setVehicleVin(appointment.getVehicle().getVin());
        if (appointment.getVehicle().getUser() != null) {
            dto.setVehicleOwnerName(appointment.getVehicle().getUser().getFirstName() + " " + appointment.getVehicle().getUser().getLastName());
            dto.setVehicleOwnerEmail(appointment.getVehicle().getUser().getEmail());
            dto.setVehicleOwnerPhoneNumber(appointment.getVehicle().getUser().getPhoneNumber());
        }
        return dto;
    }

    public static class EmailAlreadyUsedException extends UserException {
        public EmailAlreadyUsedException() { super("Email is already used by another user"); }
    }

    public static class IncorrectPasswordException extends UserException {
        public IncorrectPasswordException() { super("Old password is incorrect"); }
    }
} 