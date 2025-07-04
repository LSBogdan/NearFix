package org.example.backend.exception.comment;

import java.util.UUID;

public class CommentNotFoundException extends CommentException {
    public CommentNotFoundException(UUID commentId) {
        super("Comment not found with id: " + commentId);
    }
} 