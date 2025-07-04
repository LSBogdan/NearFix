package org.example.backend.dto.like;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LikeRequest {
    private UUID postId;
    private boolean isLike;
}