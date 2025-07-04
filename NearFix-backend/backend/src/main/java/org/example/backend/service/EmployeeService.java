package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.employee.EmployeeCreateRequest;
import org.example.backend.dto.employee.EmployeeResponse;
import org.example.backend.dto.user.AddressResponse;
import org.example.backend.entity.Address;
import org.example.backend.entity.Garage;
import org.example.backend.entity.Role;
import org.example.backend.entity.User;
import org.example.backend.exception.employee.EmployeeNotFoundException;
import org.example.backend.exception.employee.InvalidEmployeeDataException;
import org.example.backend.exception.garage.GarageNotFoundException;
import org.example.backend.exception.user.UserNotFoundException;
import org.example.backend.repository.AddressRepository;
import org.example.backend.repository.GarageRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.example.backend.dto.appointment.AppointmentStatusUpdateRequest;
import org.example.backend.entity.Appointment;
import org.example.backend.entity.AppointmentStatus;
import org.example.backend.repository.AppointmentRepository;
import org.example.backend.dto.appointment.AppointmentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final GarageRepository garageRepository;
    private final PasswordEncoder passwordEncoder;
    private final S3Service s3Service;
    private final EmailService emailService;
    private final AppointmentRepository appointmentRepository;

    @Transactional
    public EmployeeResponse createEmployee(EmployeeCreateRequest request) throws IOException {
        validateEmployeeRequest(request);

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new InvalidEmployeeDataException("Email already exists");
        }

        // Verify garage exists and is approved
        Garage garage = garageRepository.findById(request.getGarageId())
                .orElseThrow(() -> new GarageNotFoundException(request.getGarageId()));

        if (garage.getStatus() != org.example.backend.entity.GarageStatus.APPROVED) {
            throw new InvalidEmployeeDataException("Cannot create employee for non-approved garage");
        }

        // Create address
        Address address = new Address();
        address.setCountry(request.getAddress().getCountry());
        address.setCity(request.getAddress().getCity());
        address.setStreet(request.getAddress().getStreet());
        address.setNumber(request.getAddress().getNumber());
        address.setZipCode(request.getAddress().getZipCode());
        address.setLatitude(request.getAddress().getLatitude());
        address.setLongitude(request.getAddress().getLongitude());
        address = addressRepository.save(address);

        // Upload profile photo if provided
        String profilePhotoUrl = null;
        if (request.getProfilePhoto() != null && !request.getProfilePhoto().isEmpty()) {
            profilePhotoUrl = s3Service.uploadProfilePhoto(request.getProfilePhoto(), request.getEmail());
        }

        // Generate a temporary password
        String tempPassword = generateTemporaryPassword();

        // Log employee credentials
        System.out.println("New employee created. Email: " + request.getEmail() + ", Temporary Password: " + tempPassword);

        // Create user
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(request.getRole());
        user.setAddress(address);
        user.setProfilePhotoUrl(profilePhotoUrl);
        user.setGarage(garage);

        user = userRepository.save(user);

        // Send email with temporary password
        try {
            emailService.sendEmployeeAccountCreated(
                request.getEmail(),
                request.getFirstName() + " " + request.getLastName(),
                tempPassword,
                garage.getName()
            );
        } catch (Exception e) {
            // Log the email error but don't fail the employee creation
            System.err.println("Failed to send employee account email: " + e.getMessage());
        }

        return mapToEmployeeResponse(user, garage);
    }

    @Transactional
    public List<EmployeeResponse> getEmployeesByGarage(UUID garageId) {
        Garage garage = garageRepository.findById(garageId)
                .orElseThrow(() -> new GarageNotFoundException(garageId));

        List<User> employees = userRepository.findEmployeesByGarageAndRoles(
                List.of(Role.MECHANIC_GENERAL, Role.MECHANIC_WHEELS, Role.MECHANIC_AC, 
                       Role.MECHANIC_BODYWORK, Role.MECHANIC_PAINT, Role.MECHANIC_ELECTRIC, 
                       Role.MECHANIC_ENGINE, Role.MECHANIC_TRANSMISSION, Role.RECEPTIONIST, 
                       Role.CASHIER, Role.CLEANER, Role.PARTS_MANAGER),
                garageId
        );

        return employees.stream()
                .map(employee -> mapToEmployeeResponse(employee, garage))
                .collect(Collectors.toList());
    }

    @Transactional
    public EmployeeResponse getEmployee(UUID employeeId) {
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new EmployeeNotFoundException(employeeId));

        if (!isEmployeeRole(employee.getRole())) {
            throw new EmployeeNotFoundException(employeeId);
        }

        // Find the garage where this employee works through appointments
        Garage garage = employee.getAppointments().stream()
                .map(appointment -> appointment.getGarage())
                .findFirst()
                .orElse(null);

        // If no garage found through appointments, try to find any garage associated with the employee
        if (garage == null) {
            // This is a fallback - in a more complete implementation, you might want to add a direct relationship
            // between employees and garages instead of relying on appointments
            garage = garageRepository.findByUser_UserId(employee.getUserId())
                    .stream()
                    .findFirst()
                    .orElse(null);
        }

        return mapToEmployeeResponse(employee, garage);
    }

    @Transactional
    public EmployeeResponse updateEmployee(UUID employeeId, EmployeeCreateRequest request) throws IOException {
        validateEmployeeRequest(request);

        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new EmployeeNotFoundException(employeeId));

        if (!isEmployeeRole(employee.getRole())) {
            throw new EmployeeNotFoundException(employeeId);
        }

        // Check if email already exists (excluding current employee)
        if (!employee.getEmail().equals(request.getEmail()) && 
            userRepository.existsByEmail(request.getEmail())) {
            throw new InvalidEmployeeDataException("Email already exists");
        }

        // Verify garage exists and is approved
        Garage garage = garageRepository.findById(request.getGarageId())
                .orElseThrow(() -> new GarageNotFoundException(request.getGarageId()));

        if (garage.getStatus() != org.example.backend.entity.GarageStatus.APPROVED) {
            throw new InvalidEmployeeDataException("Cannot assign employee to non-approved garage");
        }

        // Update address
        Address address = employee.getAddress();
        address.setCountry(request.getAddress().getCountry());
        address.setCity(request.getAddress().getCity());
        address.setStreet(request.getAddress().getStreet());
        address.setNumber(request.getAddress().getNumber());
        address.setZipCode(request.getAddress().getZipCode());
        address.setLatitude(request.getAddress().getLatitude());
        address.setLongitude(request.getAddress().getLongitude());
        addressRepository.save(address);

        // Handle profile photo update if provided
        if (request.getProfilePhoto() != null && !request.getProfilePhoto().isEmpty()) {
            String photoUrl = s3Service.updateProfilePhoto(request.getProfilePhoto(), request.getEmail());
            employee.setProfilePhotoUrl(photoUrl);
        }

        // Update employee data
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setPhoneNumber(request.getPhoneNumber());
        employee.setRole(request.getRole());
        employee.setGarage(garage);

        employee = userRepository.save(employee);

        return mapToEmployeeResponse(employee, garage);
    }

    @Transactional
    public void deleteEmployee(UUID employeeId) {
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new EmployeeNotFoundException(employeeId));

        if (!isEmployeeRole(employee.getRole())) {
            throw new EmployeeNotFoundException(employeeId);
        }

        // Delete profile photo if exists
        if (employee.getProfilePhotoUrl() != null) {
            s3Service.deleteProfilePhoto(employee.getEmail());
        }

        userRepository.delete(employee);
    }

    @Transactional
    public EmployeeResponse createEmployeeForGarageOwner(EmployeeCreateRequest request, String ownerEmail) throws IOException {
        validateEmployeeRequest(request);

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new InvalidEmployeeDataException("Email already exists");
        }

        // Verify garage exists, is approved, and belongs to the garage owner
        Garage garage = garageRepository.findById(request.getGarageId())
                .orElseThrow(() -> new GarageNotFoundException(request.getGarageId()));

        if (garage.getStatus() != org.example.backend.entity.GarageStatus.APPROVED) {
            throw new InvalidEmployeeDataException("Cannot create employee for non-approved garage");
        }

        // Verify the garage belongs to the authenticated user
        if (!garage.getUser().getEmail().equals(ownerEmail)) {
            throw new InvalidEmployeeDataException("You can only create employees for your own garage");
        }

        // Create address
        Address address = new Address();
        address.setCountry(request.getAddress().getCountry());
        address.setCity(request.getAddress().getCity());
        address.setStreet(request.getAddress().getStreet());
        address.setNumber(request.getAddress().getNumber());
        address.setZipCode(request.getAddress().getZipCode());
        address.setLatitude(request.getAddress().getLatitude());
        address.setLongitude(request.getAddress().getLongitude());
        address = addressRepository.save(address);

        // Upload profile photo if provided
        String profilePhotoUrl = null;
        if (request.getProfilePhoto() != null && !request.getProfilePhoto().isEmpty()) {
            profilePhotoUrl = s3Service.uploadProfilePhoto(request.getProfilePhoto(), request.getEmail());
        }

        // Generate a temporary password
        String tempPassword = generateTemporaryPassword();

        // Log employee credentials
        System.out.println("New employee created by garage owner. Email: " + request.getEmail() + ", Temporary Password: " + tempPassword);

        // Create user
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(request.getRole());
        user.setAddress(address);
        user.setProfilePhotoUrl(profilePhotoUrl);
        user.setGarage(garage);

        user = userRepository.save(user);

        // Send email with temporary password
        try {
            emailService.sendEmployeeAccountCreated(
                request.getEmail(),
                request.getFirstName() + " " + request.getLastName(),
                tempPassword,
                garage.getName()
            );
        } catch (Exception e) {
            // Log the email error but don't fail the employee creation
            System.err.println("Failed to send employee account email: " + e.getMessage());
        }

        return mapToEmployeeResponse(user, garage);
    }

    @Transactional
    public List<EmployeeResponse> getEmployeesByGarageForOwner(UUID garageId, String ownerEmail) {
        Garage garage = garageRepository.findById(garageId)
                .orElseThrow(() -> new GarageNotFoundException(garageId));

        // Verify the garage belongs to the authenticated user
        if (!garage.getUser().getEmail().equals(ownerEmail)) {
            throw new InvalidEmployeeDataException("You can only view employees for your own garage");
        }

        // Get all users with employee roles that work at this garage through appointments
        List<User> employees = userRepository.findEmployeesByGarageAndRoles(
                List.of(Role.MECHANIC_GENERAL, Role.MECHANIC_WHEELS, Role.MECHANIC_AC, 
                       Role.MECHANIC_BODYWORK, Role.MECHANIC_PAINT, Role.MECHANIC_ELECTRIC, 
                       Role.MECHANIC_ENGINE, Role.MECHANIC_TRANSMISSION, Role.RECEPTIONIST, 
                       Role.CASHIER, Role.CLEANER, Role.PARTS_MANAGER),
                garageId
        );

        return employees.stream()
                .map(employee -> mapToEmployeeResponse(employee, garage))
                .collect(Collectors.toList());
    }

    @Transactional
    public EmployeeResponse getEmployeeForOwner(UUID employeeId, String ownerEmail) {
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new EmployeeNotFoundException(employeeId));

        if (!isEmployeeRole(employee.getRole())) {
            throw new EmployeeNotFoundException(employeeId);
        }

        // Find the garage where this employee works through appointments
        Garage garage = employee.getAppointments().stream()
                .map(appointment -> appointment.getGarage())
                .findFirst()
                .orElse(null);

        // If no garage found through appointments, try to find any garage associated with the employee
        if (garage == null) {
            garage = garageRepository.findByUser_UserId(employee.getUserId())
                    .stream()
                    .findFirst()
                    .orElse(null);
        }

        // Verify the garage belongs to the authenticated user
        if (garage == null || !garage.getUser().getEmail().equals(ownerEmail)) {
            throw new InvalidEmployeeDataException("You can only view employees from your own garage");
        }

        return mapToEmployeeResponse(employee, garage);
    }

    @Transactional
    public EmployeeResponse updateEmployeeForOwner(UUID employeeId, EmployeeCreateRequest request, String ownerEmail) throws IOException {
        validateEmployeeRequest(request);

        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new EmployeeNotFoundException(employeeId));

        if (!isEmployeeRole(employee.getRole())) {
            throw new EmployeeNotFoundException(employeeId);
        }

        // Find the garage where this employee works through appointments
        Garage currentGarage = employee.getAppointments().stream()
                .map(appointment -> appointment.getGarage())
                .findFirst()
                .orElse(null);

        // Verify the current garage belongs to the authenticated user
        if (currentGarage == null || !currentGarage.getUser().getEmail().equals(ownerEmail)) {
            throw new InvalidEmployeeDataException("You can only update employees from your own garage");
        }

        // Check if email already exists (excluding current employee)
        if (!employee.getEmail().equals(request.getEmail()) && 
            userRepository.existsByEmail(request.getEmail())) {
            throw new InvalidEmployeeDataException("Email already exists");
        }

        // Verify new garage exists, is approved, and belongs to the garage owner
        Garage newGarage = garageRepository.findById(request.getGarageId())
                .orElseThrow(() -> new GarageNotFoundException(request.getGarageId()));

        if (newGarage.getStatus() != org.example.backend.entity.GarageStatus.APPROVED) {
            throw new InvalidEmployeeDataException("Cannot assign employee to non-approved garage");
        }

        if (!newGarage.getUser().getEmail().equals(ownerEmail)) {
            throw new InvalidEmployeeDataException("You can only assign employees to your own garage");
        }

        // Update address
        Address address = employee.getAddress();
        address.setCountry(request.getAddress().getCountry());
        address.setCity(request.getAddress().getCity());
        address.setStreet(request.getAddress().getStreet());
        address.setNumber(request.getAddress().getNumber());
        address.setZipCode(request.getAddress().getZipCode());
        address.setLatitude(request.getAddress().getLatitude());
        address.setLongitude(request.getAddress().getLongitude());
        addressRepository.save(address);

        // Handle profile photo update if provided
        if (request.getProfilePhoto() != null && !request.getProfilePhoto().isEmpty()) {
            String photoUrl = s3Service.updateProfilePhoto(request.getProfilePhoto(), request.getEmail());
            employee.setProfilePhotoUrl(photoUrl);
        }

        // Update employee data
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setPhoneNumber(request.getPhoneNumber());
        employee.setRole(request.getRole());
        employee.setGarage(newGarage);

        employee = userRepository.save(employee);

        return mapToEmployeeResponse(employee, newGarage);
    }

    @Transactional
    public void deleteEmployeeForOwner(UUID employeeId, String ownerEmail) {
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new EmployeeNotFoundException(employeeId));

        if (!isEmployeeRole(employee.getRole())) {
            throw new EmployeeNotFoundException(employeeId);
        }

        // Find the garage where this employee works through appointments
        Garage garage = employee.getAppointments().stream()
                .map(appointment -> appointment.getGarage())
                .findFirst()
                .orElse(null);

        // Verify the garage belongs to the authenticated user
        if (garage == null || !garage.getUser().getEmail().equals(ownerEmail)) {
            throw new InvalidEmployeeDataException("You can only delete employees from your own garage");
        }

        // Delete profile photo if exists
        if (employee.getProfilePhotoUrl() != null) {
            s3Service.deleteProfilePhoto(employee.getEmail());
        }

        userRepository.delete(employee);
    }

    @Transactional
    public Appointment updateAppointmentStatus(AppointmentStatusUpdateRequest request, String employeeEmail) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        if (!appointment.getEmployee().getEmail().equals(employeeEmail)) {
            throw new RuntimeException("You are not authorized to update this appointment");
        }
        // Dacă statusul este REFUZAT, încercăm re-asignarea
        if (request.getStatus() == AppointmentStatus.CANCELLED) { // presupunem că REFUZAT = CANCELLED
            // Caută angajați compatibili (rol + garaj), excludând pe cel care a refuzat
            Role areaRole = appointment.getEmployee().getRole();
            List<User> employees = userRepository.findEmployeesByGarageAndRoles(
                List.of(areaRole), appointment.getGarage().getGarageId()
            );
            // Exclude angajatul curent
            employees = employees.stream()
                .filter(e -> !e.getUserId().equals(appointment.getEmployee().getUserId()))
                .collect(java.util.stream.Collectors.toList());
            if (!employees.isEmpty()) {
                // Selectează angajatul cu cele mai puține programări în acea zi
                User selectedEmployee = null;
                long minAppointments = Long.MAX_VALUE;
                List<User> minEmployees = new java.util.ArrayList<>();
                for (User employee : employees) {
                    long count = appointmentRepository.countByEmployeeAndDate(employee.getUserId(), appointment.getSelectedDate());
                    if (count < minAppointments) {
                        minAppointments = count;
                        minEmployees.clear();
                        minEmployees.add(employee);
                    } else if (count == minAppointments) {
                        minEmployees.add(employee);
                    }
                }
                if (minEmployees.size() == 1) {
                    selectedEmployee = minEmployees.get(0);
                } else {
                    // Tie-breaker: cele mai puține programări în săptămână
                    java.time.LocalDate date = appointment.getSelectedDate();
                    java.time.DayOfWeek dow = date.getDayOfWeek();
                    java.time.LocalDate weekStart = date.minusDays(dow.getValue() - 1);
                    java.time.LocalDate weekEnd = weekStart.plusDays(6);
                    // Refactor: găsește angajatul cu cele mai puține programări în săptămână fără a modifica variabile din lambda
                    User minWeekEmployee = null;
                    long minWeek = Long.MAX_VALUE;
                    for (User employee : minEmployees) {
                        long weekCount = appointmentRepository.countByEmployeeAndWeek(employee.getUserId(), weekStart, weekEnd);
                        if (weekCount < minWeek) {
                            minWeek = weekCount;
                            minWeekEmployee = employee;
                        }
                    }
                    selectedEmployee = minWeekEmployee;
                }
                // Reasignează appointment-ul
                appointment.setEmployee(selectedEmployee);
                appointment.setStatus(AppointmentStatus.PENDING);
                Appointment savedAppointment = appointmentRepository.save(appointment);
                // Notifică noul angajat
                try {
                    emailService.sendEmployeeAppointmentAssigned(selectedEmployee.getEmail(), savedAppointment.getSelectedDate(), savedAppointment.getGarage().getName());
                } catch (Exception e) {
                    System.err.println("Failed to send appointment notification: " + e.getMessage());
                }
                return savedAppointment;
            } else {
                // Nu există angajați disponibili, notifică clientul
                String customerEmail = appointment.getVehicle().getUser().getEmail();
                try {
                    emailService.sendCustomerNoEmployeesAvailable(customerEmail, appointment.getSelectedDate(), appointment.getGarage().getName());
                } catch (Exception e) {
                    System.err.println("Failed to send customer notification: " + e.getMessage());
                }
                // Appointment rămâne cu status CANCELLED
                appointment.setStatus(AppointmentStatus.CANCELLED);
                Appointment cancelledAppointment = appointmentRepository.save(appointment);
                return cancelledAppointment;
            }
        } else {
            // Status normal (CONFIRMED, IN_PROGRESS, COMPLETED etc.)
            appointment.setStatus(request.getStatus());
            Appointment updatedAppointment = appointmentRepository.save(appointment);
            // Notifică clientul (vehicle owner)
            String customerEmail = updatedAppointment.getVehicle().getUser().getEmail();
            try {
                emailService.sendCustomerAppointmentStatusUpdate(customerEmail, updatedAppointment.getSelectedDate(), updatedAppointment.getStatus().name());
            } catch (Exception e) {
                System.err.println("Failed to send customer notification: " + e.getMessage());
            }
            return updatedAppointment;
        }
    }

    @Transactional(readOnly = true)
    public List<Appointment> getMyAppointments(String employeeEmail) {
        User employee = userRepository.findByEmail(employeeEmail)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        return appointmentRepository.findByEmployee_UserId(employee.getUserId());
    }

    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getMyAppointmentsPaginated(String employeeEmail, Pageable pageable) {
        User employee = userRepository.findByEmail(employeeEmail)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        Pageable sortedPageable = org.springframework.data.domain.PageRequest.of(
            pageable.getPageNumber(),
            pageable.getPageSize(),
            pageable.getSort().and(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "selectedDate"))
        );
        Page<Appointment> appointments = appointmentRepository.findByEmployee_UserId(employee.getUserId(), sortedPageable);
        return appointments.map(this::mapToAppointmentResponse);
    }

    private void validateEmployeeRequest(EmployeeCreateRequest request) {
        if (request.getFirstName() == null || request.getFirstName().trim().isEmpty()) {
            throw new InvalidEmployeeDataException("First name cannot be empty");
        }
        if (request.getLastName() == null || request.getLastName().trim().isEmpty()) {
            throw new InvalidEmployeeDataException("Last name cannot be empty");
        }
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new InvalidEmployeeDataException("Email cannot be empty");
        }
        if (request.getPhoneNumber() == null || request.getPhoneNumber().trim().isEmpty()) {
            throw new InvalidEmployeeDataException("Phone number cannot be empty");
        }
        if (request.getRole() == null) {
            throw new InvalidEmployeeDataException("Role cannot be empty");
        }
        if (!isEmployeeRole(request.getRole())) {
            throw new InvalidEmployeeDataException("Invalid employee role");
        }
        if (request.getAddress() == null) {
            throw new InvalidEmployeeDataException("Address cannot be null");
        }
        if (request.getGarageId() == null) {
            throw new InvalidEmployeeDataException("Garage ID cannot be null");
        }
    }

    private boolean isEmployeeRole(Role role) {
        return role != Role.ADMIN && role != Role.GARAGE_OWNER && role != Role.CUSTOMER;
    }

    private String generateTemporaryPassword() {
        // Generate a random 8-character password
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder password = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            password.append(chars.charAt((int) (Math.random() * chars.length())));
        }
        return password.toString();
    }

    private EmployeeResponse mapToEmployeeResponse(User employee, Garage garage) {
        return EmployeeResponse.builder()
                .userId(employee.getUserId())
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .email(employee.getEmail())
                .phoneNumber(employee.getPhoneNumber())
                .profilePhotoUrl(employee.getProfilePhotoUrl())
                .role(employee.getRole())
                .address(AddressResponse.builder()
                        .addressId(employee.getAddress().getAddressId())
                        .country(employee.getAddress().getCountry())
                        .city(employee.getAddress().getCity())
                        .street(employee.getAddress().getStreet())
                        .number(employee.getAddress().getNumber())
                        .zipCode(employee.getAddress().getZipCode())
                        .latitude(employee.getAddress().getLatitude())
                        .longitude(employee.getAddress().getLongitude())
                        .build())
                .garageId(garage != null ? garage.getGarageId() : null)
                .garageName(garage != null ? garage.getName() : null)
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
        // Area: use employee role label
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
        // Set vehicle owner info
        if (appointment.getVehicle().getUser() != null) {
            dto.setVehicleOwnerName(appointment.getVehicle().getUser().getFirstName() + " " + appointment.getVehicle().getUser().getLastName());
            dto.setVehicleOwnerEmail(appointment.getVehicle().getUser().getEmail());
            dto.setVehicleOwnerPhoneNumber(appointment.getVehicle().getUser().getPhoneNumber());
        }
        return dto;
    }
} 