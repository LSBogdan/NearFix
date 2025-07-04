package org.example.backend.dto.comment;

import lombok.Data;

@Data
public class CommentFilterRequest {
    private String searchTerm;
    private String sortBy = "creationDate";
    private String sortDirection = "DESC";
    private Integer page = 0;
    private Integer size = 10;
} 