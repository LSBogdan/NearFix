package org.example.backend.dto.like;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LikeResponse {
    private UUID postId;
    private Long likeCount;
    private boolean hasLiked;
}