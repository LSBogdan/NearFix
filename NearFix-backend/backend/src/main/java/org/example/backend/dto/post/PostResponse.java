package org.example.backend.dto.post;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class PostResponse {
    private UUID postId;
    private String title;
    private String description;
    private Integer upvotes;
    private LocalDate creationDate;
    private String authorName;
    private UUID authorId;
    private String authorEmail;
    private Boolean isEdited;
} 