package org.example.backend.dto.commentlike;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CommentLikeResponse {
    private UUID commentId;
    private Long likeCount;
    private boolean hasLiked;
} 