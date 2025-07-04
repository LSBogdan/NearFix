package org.example.backend.repository;

import org.example.backend.entity.Appointment;
import org.example.backend.entity.AppointmentStatus;
import org.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    // Find appointments for an employee on a specific date
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.employee.userId = :employeeId AND a.selectedDate = :date")
    long countByEmployeeAndDate(@Param("employeeId") UUID employeeId, @Param("date") LocalDate date);

    // Find appointments for an employee in a week (Monday to Sunday)
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.employee.userId = :employeeId AND a.selectedDate BETWEEN :startDate AND :endDate")
    long countByEmployeeAndWeek(@Param("employeeId") UUID employeeId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // Find all appointments for a garage on a specific date
    List<Appointment> findByGarage_GarageIdAndSelectedDate(UUID garageId, LocalDate selectedDate);

    // Find all appointments for a garage in a week
    List<Appointment> findByGarage_GarageIdAndSelectedDateBetween(UUID garageId, LocalDate startDate, LocalDate endDate);

    List<Appointment> findByEmployee_UserId(UUID employeeId);

    List<Appointment> findByVehicle_User_UserId(UUID userId);

    List<Appointment> findByVehicle_VehicleIdAndStatus(UUID vehicleId, AppointmentStatus status);

    // Paginated find all appointments for a garage on a specific date
    Page<Appointment> findByGarage_GarageIdAndSelectedDate(UUID garageId, LocalDate selectedDate, Pageable pageable);

    // Paginated find all appointments for a garage in a week
    Page<Appointment> findByGarage_GarageIdAndSelectedDateBetween(UUID garageId, LocalDate startDate, LocalDate endDate, Pageable pageable);

    org.springframework.data.domain.Page<Appointment> findByEmployee_UserId(UUID employeeId, Pageable pageable);

    org.springframework.data.domain.Page<Appointment> findByVehicle_User_UserId(UUID userId, Pageable pageable);
} 