package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.garage.GarageRequest;
import org.example.backend.dto.garage.GarageResponse;
import org.example.backend.dto.garage.GarageScheduleResponse;
import org.example.backend.dto.garage.GarageSearchRequest;
import org.example.backend.entity.Address;
import org.example.backend.entity.Garage;
import org.example.backend.entity.GarageSchedule;
import org.example.backend.entity.Role;
import org.example.backend.entity.User;
import org.example.backend.exception.garage.InvalidGarageDataException;
import org.example.backend.exception.garage.GarageNotFoundException;
import org.example.backend.exception.user.UserNotFoundException;
import org.example.backend.repository.AddressRepository;
import org.example.backend.repository.GarageRepository;
import org.example.backend.repository.GarageScheduleRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import org.example.backend.entity.GarageStatus;
import java.io.IOException;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.example.backend.dto.appointment.AppointmentCreateRequest;
import org.example.backend.entity.Appointment;
import org.example.backend.entity.AppointmentStatus;
import org.example.backend.entity.Vehicle;
import org.example.backend.repository.AppointmentRepository;
import org.example.backend.repository.VehicleRepository;
import org.example.backend.dto.appointment.AppointmentResponse;

@Service
@RequiredArgsConstructor
public class GarageService {
    private final GarageRepository garageRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final GarageScheduleRepository scheduleRepository;
    private final S3Service s3Service;
    private final EmailService emailService;
    private final AppointmentRepository appointmentRepository;
    private final VehicleRepository vehicleRepository;

    @Transactional
    public GarageResponse createGarage(GarageRequest request, String userEmail) throws IOException {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        validateGarageRequest(request);
        validateGarageSchedule(request.getSchedule());

        Address address = new Address();
        address.setCountry(request.getAddress().getCountry());
        address.setCity(request.getAddress().getCity());
        address.setStreet(request.getAddress().getStreet());
        address.setNumber(request.getAddress().getNumber());
        address.setZipCode(request.getAddress().getZipCode());
        address.setLatitude(request.getAddress().getLatitude());
        address.setLongitude(request.getAddress().getLongitude());
        address = addressRepository.save(address);

        Garage garage = new Garage();
        garage.setUser(user);
        garage.setAddress(address);
        garage.setName(request.getName());
        garage.setStatus(GarageStatus.PENDING);

        garage = garageRepository.save(garage); 

        if (request.getPhoto() != null) {
            garage.setPhotoUrl(s3Service.uploadGaragePhoto(request.getPhoto(), garage.getGarageId()));
        }

        if (request.getDocument() != null) {
            garage.setDocumentUrl(s3Service.uploadGarageDocument(request.getDocument(), garage.getGarageId()));
        }

        garage = garageRepository.save(garage); 

    
        if (request.getSchedule() != null && !request.getSchedule().isEmpty()) {
            try {
   
                scheduleRepository.deleteByGarage_GarageId(garage.getGarageId());
                

                for (var scheduleRequest : request.getSchedule()) {
                    GarageSchedule schedule = new GarageSchedule();
                    schedule.setGarage(garage);
                    schedule.setDayOfWeek(scheduleRequest.getDayOfWeek());
                    schedule.setOpeningTime(scheduleRequest.getOpeningTime());
                    schedule.setClosingTime(scheduleRequest.getClosingTime());
                    schedule.setIsClosed(scheduleRequest.getIsClosed());
                    scheduleRepository.save(schedule);
                }
            } catch (Exception e) {
                garageRepository.delete(garage);
                addressRepository.delete(address);
                throw new InvalidGarageDataException("Failed to create garage schedule: " + e.getMessage());
            }
        }

        try {
            emailService.sendGarageApprovalRequest(
                garage.getName(),
                user.getFirstName() + " " + user.getLastName(),
                user.getEmail()
            );
        } catch (Exception e) {
            System.err.println("Failed to send email notification: " + e.getMessage());
        }

        return mapToGarageResponse(garage);
    }

    public List<GarageResponse> getUserGarages(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        return garageRepository.findByUser_UserId(user.getUserId())
                .stream()
                .map(this::mapToGarageResponse)
                .collect(Collectors.toList());
    }

    public GarageResponse getGarage(UUID garageId) {
        Garage garage = garageRepository.findById(garageId)
                .orElseThrow(() -> new GarageNotFoundException(garageId));
        return mapToGarageResponse(garage);
    }

    @Transactional
    public GarageResponse updateGarage(UUID garageId, GarageRequest request, String userEmail) throws IOException {
        validateGarageRequest(request);
        validateGarageSchedule(request.getSchedule());

        Garage garage = garageRepository.findById(garageId)
                .orElseThrow(() -> new GarageNotFoundException(garageId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        if (!garage.getUser().getUserId().equals(user.getUserId())) {
            throw new InvalidGarageDataException("You don't have permission to update this garage");
        }

        // Update address
        Address address = garage.getAddress();
        address.setCountry(request.getAddress().getCountry());
        address.setCity(request.getAddress().getCity());
        address.setStreet(request.getAddress().getStreet());
        address.setNumber(request.getAddress().getNumber());
        address.setZipCode(request.getAddress().getZipCode());
        address.setLatitude(request.getAddress().getLatitude());
        address.setLongitude(request.getAddress().getLongitude());
        addressRepository.save(address);

        garage.setName(request.getName().trim());

        if (request.getPhoto() != null && !request.getPhoto().isEmpty()) {
            String photoUrl = s3Service.uploadGaragePhoto(request.getPhoto(), garageId);
            garage.setPhotoUrl(photoUrl);
        }

        if (request.getDocument() != null && !request.getDocument().isEmpty()) {
            String documentUrl = s3Service.uploadGarageDocument(request.getDocument(), garageId);
            garage.setDocumentUrl(documentUrl);
        }

        if (request.getSchedule() != null) {
            scheduleRepository.deleteByGarage_GarageId(garageId);
            scheduleRepository.flush(); // Ensure deletions are executed before inserts
            for (var scheduleRequest : request.getSchedule()) {
                GarageSchedule schedule = new GarageSchedule();
                schedule.setGarage(garage);
                schedule.setDayOfWeek(scheduleRequest.getDayOfWeek());
                schedule.setOpeningTime(scheduleRequest.getOpeningTime());
                schedule.setClosingTime(scheduleRequest.getClosingTime());
                schedule.setIsClosed(scheduleRequest.getIsClosed());
                scheduleRepository.save(schedule);
            }
        }

        garage = garageRepository.save(garage);
        return mapToGarageResponse(garage);
    }

    @Transactional
    public void deleteGarage(UUID garageId, String userEmail) {
        Garage garage = garageRepository.findById(garageId)
                .orElseThrow(() -> new GarageNotFoundException(garageId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        if (!garage.getUser().getUserId().equals(user.getUserId())) {
            throw new InvalidGarageDataException("You don't have permission to delete this garage");
        }

        if (garage.getPhotoUrl() != null) {
            s3Service.deleteGaragePhoto(garageId);
        }

        if (garage.getDocumentUrl() != null) {
            s3Service.deleteGarageDocument(garageId);
        }

        garageRepository.delete(garage);
    }

    public void deleteGaragePhoto(UUID garageId, String userEmail) {
        Garage garage = garageRepository.findById(garageId)
                .orElseThrow(() -> new GarageNotFoundException(garageId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        if (!garage.getUser().getUserId().equals(user.getUserId())) {
            throw new InvalidGarageDataException("You don't have permission to modify this garage");
        }

        s3Service.deleteGaragePhoto(garageId);
        garage.setPhotoUrl(null);
        garageRepository.save(garage);
    }

    public void deleteGarageDocument(UUID garageId, String userEmail) {
        Garage garage = garageRepository.findById(garageId)
                .orElseThrow(() -> new GarageNotFoundException(garageId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        if (!garage.getUser().getUserId().equals(user.getUserId())) {
            throw new InvalidGarageDataException("You don't have permission to modify this garage");
        }

        s3Service.deleteGarageDocument(garageId);
        garage.setDocumentUrl(null);
        garageRepository.save(garage);
    }

    private void validateGarageRequest(GarageRequest request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new InvalidGarageDataException("Garage name cannot be empty");
        }
        if (request.getAddress() == null) {
            throw new InvalidGarageDataException("Address cannot be null");
        }
        if (request.getAddress().getCountry() == null || request.getAddress().getCountry().trim().isEmpty()) {
            throw new InvalidGarageDataException("Country cannot be empty");
        }
        if (request.getAddress().getCity() == null || request.getAddress().getCity().trim().isEmpty()) {
            throw new InvalidGarageDataException("City cannot be empty");
        }
        if (request.getAddress().getStreet() == null || request.getAddress().getStreet().trim().isEmpty()) {
            throw new InvalidGarageDataException("Street cannot be empty");
        }
        if (request.getAddress().getNumber() == null) {
            throw new InvalidGarageDataException("Number cannot be empty");
        }
        if (request.getAddress().getZipCode() == null) {
            throw new InvalidGarageDataException("Zip code cannot be empty");
        }
    }

    private void validateGarageSchedule(List<org.example.backend.dto.garage.GarageScheduleRequest> scheduleRequests) {
        if (scheduleRequests == null) return;
        java.util.Set<Integer> days = new java.util.HashSet<>();
        for (org.example.backend.dto.garage.GarageScheduleRequest req : scheduleRequests) {
            if (!days.add(req.getDayOfWeek())) {
                throw new InvalidGarageDataException("Duplicate dayOfWeek in schedule: " + req.getDayOfWeek() + ". Each day (0=Monday, 6=Sunday) must be unique.");
            }
            if (req.getDayOfWeek() < 0 || req.getDayOfWeek() > 6) {
                throw new InvalidGarageDataException("dayOfWeek must be between 0 (Monday) and 6 (Sunday)");
            }
        }
    }

    private GarageResponse mapToGarageResponse(Garage garage) {
        List<GarageScheduleResponse> schedule = scheduleRepository.findByGarage_GarageId(garage.getGarageId())
                .stream()
                .map(this::mapToScheduleResponse)
                .collect(Collectors.toList());

        return GarageResponse.builder()
                .garageId(garage.getGarageId())
                .name(garage.getName())
                .userId(garage.getUser().getUserId())
                .ownerName(garage.getUser().getFirstName() + " " + garage.getUser().getLastName())
                .ownerEmail(garage.getUser().getEmail())
                .ownerPhoneNumber(garage.getUser().getPhoneNumber())
                .ownerProfilePhotoUrl(garage.getUser().getProfilePhotoUrl())
                .address(mapToAddressResponse(garage.getAddress()))
                .photoUrl(garage.getPhotoUrl())
                .documentUrl(garage.getDocumentUrl())
                .status(garage.getStatus())
                .rejectionReason(garage.getRejectionReason())
                .schedule(schedule)
                .build();
    }

    private GarageScheduleResponse mapToScheduleResponse(GarageSchedule schedule) {
        return GarageScheduleResponse.builder()
                .scheduleId(schedule.getScheduleId())
                .dayOfWeek(schedule.getDayOfWeek())
                .openingTime(schedule.getOpeningTime())
                .closingTime(schedule.getClosingTime())
                .isClosed(schedule.getIsClosed())
                .build();
    }

    private org.example.backend.dto.user.AddressResponse mapToAddressResponse(org.example.backend.entity.Address address) {
        return org.example.backend.dto.user.AddressResponse.builder()
                .addressId(address.getAddressId())
                .country(address.getCountry())
                .city(address.getCity())
                .street(address.getStreet())
                .number(address.getNumber())
                .zipCode(address.getZipCode())
                .latitude(address.getLatitude())
                .longitude(address.getLongitude())
                .build();
    }

    @Transactional
    public Page<GarageResponse> searchGarages(GarageSearchRequest request) {
        List<Garage> garages = garageRepository.findByStatus(org.example.backend.entity.GarageStatus.APPROVED);

        garages = garages.stream().filter(garage ->
            garage.getUser() != null &&
            garage.getUser().getGarages() != null &&
            garage.getUser().getGarages().contains(garage) &&
            garage.getUser().getGarages().stream().anyMatch(g -> g.getGarageId().equals(garage.getGarageId())) &&
            garage.getUser().getGarages().stream().anyMatch(g ->
                g.getGarageId().equals(garage.getGarageId()) &&
                g.getUser() != null &&
                g.getUser().getGarages() != null
            ) &&
            // Caută angajați cu rol compatibil
            userRepository.findEmployeesByGarageAndRoles(
                List.of(Role.valueOf(request.getArea())),
                garage.getGarageId()
            ).size() > 0
        ).collect(Collectors.toList());

        double userLat = request.getLatitude();
        double userLon = request.getLongitude();
        List<GarageWithDistance> garageDistances = garages.stream().map(garage -> {
            double garageLat = garage.getAddress().getLatitude();
            double garageLon = garage.getAddress().getLongitude();
            double distance = haversine(userLat, userLon, garageLat, garageLon);
            return new GarageWithDistance(garage, distance);
        }).collect(Collectors.toList());

        if (request.isOpenNow()) {
            LocalTime now = LocalTime.now();
            garageDistances.sort((g1, g2) -> {
                boolean open1 = isGarageOpenNow(g1.garage, now);
                boolean open2 = isGarageOpenNow(g2.garage, now);
                if (open1 == open2) return 0;
                return open1 ? -1 : 1;
            });
        }

        garageDistances.sort((g1, g2) -> Double.compare(g1.distance, g2.distance));

        int page = request.getPage();
        int size = request.getSize();
        int start = page * size;
        int end = Math.min(start + size, garageDistances.size());
        List<GarageResponse> pageContent = garageDistances.subList(start, end).stream()
            .map(gd -> mapToGarageResponse(gd.garage))
            .collect(Collectors.toList());
        return new PageImpl<>(pageContent, PageRequest.of(page, size), garageDistances.size());
    }

    private static class GarageWithDistance {
        Garage garage;
        double distance;
        GarageWithDistance(Garage garage, double distance) {
            this.garage = garage;
            this.distance = distance;
        }
    }

    // Haversine formula pentru distanta în km
    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private boolean isGarageOpenNow(Garage garage, LocalTime now) {
        int dayOfWeek = java.time.LocalDate.now().getDayOfWeek().getValue() % 7; // 0=Luni, 6=Duminica
        return garage.getSchedule().stream().anyMatch(s -> {
            if (s.getDayOfWeek() != dayOfWeek || s.getIsClosed()) return false;
            LocalTime open = LocalTime.parse(s.getOpeningTime().toString());
            LocalTime close = LocalTime.parse(s.getClosingTime().toString());
            return (now.equals(open) || now.isAfter(open)) && (now.equals(close) || now.isBefore(close));
        });
    }

    @Transactional
    public Appointment createAppointment(AppointmentCreateRequest request, String customerEmail) {
        Garage garage = garageRepository.findById(request.getGarageId())
                .orElseThrow(() -> new GarageNotFoundException(request.getGarageId()));
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new InvalidGarageDataException("Vehicle not found"));
        if (!vehicle.getUser().getEmail().equals(customerEmail)) {
            throw new InvalidGarageDataException("You do not own this vehicle");
        }
        java.time.DayOfWeek dayOfWeek = request.getSelectedDate().getDayOfWeek();
        int dayIndex = dayOfWeek.getValue() - 1; // 0=Monday, 6=Sunday
        List<GarageSchedule> schedules = scheduleRepository.findByGarage_GarageId(garage.getGarageId());
        GarageSchedule schedule = schedules.stream().filter(s -> s.getDayOfWeek() == dayIndex).findFirst().orElse(null);
        if (schedule == null || Boolean.TRUE.equals(schedule.getIsClosed())) {
            throw new InvalidGarageDataException("Garage is closed on the selected day");
        }
        Role areaRole;
        try {
            areaRole = Role.valueOf(request.getArea());
        } catch (Exception e) {
            throw new InvalidGarageDataException("Invalid area/role: " + request.getArea());
        }
        List<User> employees = userRepository.findEmployeesByGarageAndRoles(List.of(areaRole), garage.getGarageId());
        if (employees.isEmpty()) {
            throw new InvalidGarageDataException("No employees available for the selected area");
        }
        User selectedEmployee = null;
        long minAppointments = Long.MAX_VALUE;
        List<User> minEmployees = new java.util.ArrayList<>();
        for (User employee : employees) {
            long count = appointmentRepository.countByEmployeeAndDate(employee.getUserId(), request.getSelectedDate());
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
            java.time.LocalDate date = request.getSelectedDate();
            java.time.DayOfWeek dow = date.getDayOfWeek();
            java.time.LocalDate weekStart = date.minusDays(dow.getValue() - 1);
            java.time.LocalDate weekEnd = weekStart.plusDays(6);
            long minWeek = Long.MAX_VALUE;
            for (User employee : minEmployees) {
                long weekCount = appointmentRepository.countByEmployeeAndWeek(employee.getUserId(), weekStart, weekEnd);
                if (weekCount < minWeek) {
                    minWeek = weekCount;
                    selectedEmployee = employee;
                }
            }
        }
        if (selectedEmployee == null) {
            throw new InvalidGarageDataException("No eligible employee found");
        }
        Appointment appointment = new Appointment();
        appointment.setGarage(garage);
        appointment.setVehicle(vehicle);
        appointment.setEmployee(selectedEmployee);
        appointment.setStatus(AppointmentStatus.PENDING);
        appointment.setDetails(request.getDetails());
        appointment.setSelectedDate(request.getSelectedDate());
        appointment = appointmentRepository.save(appointment);
        try {
            emailService.sendEmployeeAppointmentAssigned(selectedEmployee.getEmail(), appointment.getSelectedDate(), garage.getName());
        } catch (Exception e) {
            System.err.println("Failed to send appointment notification: " + e.getMessage());
        }
        return appointment;
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
        return dto;
    }
}