package org.example.backend.exception.post;

import java.util.UUID;

public class PostNotFoundException extends PostException {
    public PostNotFoundException(UUID postId) {
        super("Post not found with id: " + postId);
    }
} 