package org.example.backend.repository;

import org.example.backend.entity.Garage;
import org.example.backend.entity.GarageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GarageRepository extends JpaRepository<Garage, UUID> {
    List<Garage> findByUser_UserId(UUID userId);
    List<Garage> findByStatus(GarageStatus status);
}