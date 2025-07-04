package org.example.backend.dto.comment;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class CommentResponse {
    private UUID commentId;
    private String description;
    private Integer upvotes;
    private LocalDate creationDate;
    private String authorName;
    private UUID authorId;
    private String authorEmail;
    private UUID postId;
    private Boolean isEdited;
    private Boolean hasLiked;
} 