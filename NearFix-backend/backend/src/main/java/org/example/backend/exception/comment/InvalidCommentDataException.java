package org.example.backend.exception.comment;

public class InvalidCommentDataException extends CommentException {
    public InvalidCommentDataException(String message) {
        super("Invalid comment data: " + message);
    }
} 