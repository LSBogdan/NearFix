package org.example.backend.dto.commentlike;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CommentLikeUpdateMessage {
    private UUID commentId;
    private Long likeCount;
} 