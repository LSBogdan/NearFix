package org.example.backend.dto.post;

import lombok.Data;

@Data
public class PostFilterRequest {
    private String searchTerm;
    private String sortBy = "creationDate";
    private String sortDirection = "DESC";
    private Integer page = 0;
    private Integer size = 10;
} 