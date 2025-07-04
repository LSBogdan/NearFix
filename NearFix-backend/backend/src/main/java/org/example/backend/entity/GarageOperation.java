package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "Garage_Operations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GarageOperation {
    @EmbeddedId
    private GarageOperationId id;

    @ManyToOne
    @MapsId("garageId")
    @JoinColumn(name = "garage_id")
    private Garage garage;

    @ManyToOne
    @MapsId("operationId")
    @JoinColumn(name = "operation_id")
    private Operation operation;

    @Column(name = "price", nullable = false)
    private Double price;

    @Column(name = "estimated_time", nullable = false)
    private Integer estimatedTime;
}

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
class GarageOperationId implements java.io.Serializable {
    private UUID garageId;
    private UUID operationId;
} 