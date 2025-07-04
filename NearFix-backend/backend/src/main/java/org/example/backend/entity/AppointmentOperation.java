package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "Appointment_Operations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentOperation {
    @EmbeddedId
    private AppointmentOperationId id;

    @ManyToOne
    @MapsId("appointmentId")
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @ManyToOne
    @MapsId("operationId")
    @JoinColumn(name = "operation_id")
    private Operation operation;
}

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
class AppointmentOperationId implements java.io.Serializable {
    private UUID appointmentId;
    private UUID operationId;
} 