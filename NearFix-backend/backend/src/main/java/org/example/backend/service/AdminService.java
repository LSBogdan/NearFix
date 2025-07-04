package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.garage.GarageResponse;
import org.example.backend.dto.garage.GarageStatusRequest;
import org.example.backend.dto.garage.GarageScheduleResponse;
import org.example.backend.dto.user.AddressResponse;
import org.example.backend.entity.Garage;
import org.example.backend.entity.GarageStatus;
import org.example.backend.exception.garage.GarageNotFoundException;
import org.example.backend.repository.GarageRepository;
import org.example.backend.repository.GarageScheduleRepository;
import org.example.backend.repository.UserRepository;
import org.example.backend.repository.AppointmentRepository;
import org.example.backend.repository.PostRepository;
import org.example.backend.repository.CommentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final GarageRepository garageRepository;
    private final GarageScheduleRepository scheduleRepository;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    public List<GarageResponse> getPendingGarages() {
        return garageRepository.findByStatus(GarageStatus.PENDING)
                .stream()
                .map(this::mapToGarageResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public GarageResponse updateGarageStatus(UUID garageId, GarageStatusRequest request) {
        Garage garage = garageRepository.findById(garageId)
                .orElseThrow(() -> new GarageNotFoundException(garageId));

        garage.setStatus(request.getStatus());
        garage.setRejectionReason(request.getRejectionReason());

        garage = garageRepository.save(garage);

        // Send email notification to garage_owner
        emailService.sendGarageStatusUpdate(
            garage.getUser().getEmail(),
            garage.getName(),
            request.getStatus() == GarageStatus.APPROVED,
            request.getRejectionReason()
        );

        return mapToGarageResponse(garage);
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
                .address(mapToAddressResponse(garage.getAddress()))
                .photoUrl(garage.getPhotoUrl())
                .documentUrl(garage.getDocumentUrl())
                .status(garage.getStatus())
                .rejectionReason(garage.getRejectionReason())
                .schedule(schedule)
                .build();
    }

    private GarageScheduleResponse mapToScheduleResponse(org.example.backend.entity.GarageSchedule schedule) {
        return GarageScheduleResponse.builder()
                .scheduleId(schedule.getScheduleId())
                .dayOfWeek(schedule.getDayOfWeek())
                .openingTime(schedule.getOpeningTime())
                .closingTime(schedule.getClosingTime())
                .isClosed(schedule.getIsClosed())
                .build();
    }

    private AddressResponse mapToAddressResponse(org.example.backend.entity.Address address) {
        return AddressResponse.builder()
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

    public Map<String, Long> getDashboardStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("users", userRepository.count());
        stats.put("garages", garageRepository.count());
        stats.put("appointments", appointmentRepository.count());
        stats.put("posts", postRepository.count());
        stats.put("comments", commentRepository.count());
        return stats;
    }
}
