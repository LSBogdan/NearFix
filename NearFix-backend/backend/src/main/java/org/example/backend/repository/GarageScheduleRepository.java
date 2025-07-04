package org.example.backend.repository;

import org.example.backend.entity.GarageSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GarageScheduleRepository extends JpaRepository<GarageSchedule, UUID> {
    List<GarageSchedule> findByGarage_GarageId(UUID garageId);
    void deleteByGarage_GarageId(UUID garageId);
} 