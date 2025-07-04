package org.example.backend.dto.commentlike;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CommentLikeRequest {
    private UUID commentId;
    private boolean isLike;
} 