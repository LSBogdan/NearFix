package org.example.backend.repository;

import org.example.backend.entity.Role;
import org.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    
    @Query("SELECT DISTINCT u FROM User u JOIN u.appointments a WHERE u.role IN :roles AND a.garage.garageId = :garageId")
    List<User> findEmployeesWithAppointmentsByGarageAndRoles(@Param("roles") List<Role> roles, @Param("garageId") UUID garageId);
    
    @Query("SELECT u FROM User u WHERE u.role IN :roles AND u.garage.garageId = :garageId")
    List<User> findEmployeesByGarageAndRoles(@Param("roles") List<Role> roles, @Param("garageId") UUID garageId);
}