package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.comment.CommentFilterRequest;
import org.example.backend.dto.comment.CommentRequest;
import org.example.backend.dto.comment.CommentResponse;
import org.example.backend.dto.commentlike.CommentLikeRequest;
import org.example.backend.dto.commentlike.CommentLikeResponse;
import org.example.backend.service.CommentService;
import org.example.backend.service.RedisCommentLikeService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;
    private final RedisCommentLikeService redisCommentLikeService;

    @PostMapping
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable UUID postId,
            @RequestBody CommentRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(commentService.createComment(postId, request, authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<Page<CommentResponse>> getCommentsForPost(
            @PathVariable UUID postId,
            CommentFilterRequest filterRequest,
            @AuthenticationPrincipal UserDetails userDetails) {
        String userEmail = userDetails != null ? userDetails.getUsername() : null;
        return ResponseEntity.ok(commentService.getCommentsForPost(postId, filterRequest, userEmail));
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable UUID postId,
            @PathVariable UUID commentId,
            @RequestBody CommentRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(commentService.updateComment(commentId, request, authentication.getName()));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID postId,
            @PathVariable UUID commentId,
            Authentication authentication) {
        commentService.deleteComment(commentId, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/likes/batch")
    public ResponseEntity<Void> processBatchLikes(
            @RequestBody List<CommentLikeRequest> likes,
            Authentication authentication) {
        commentService.processBatchLikes(likes, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{commentId}/like")
    public ResponseEntity<CommentLikeResponse> toggleLike(
            @PathVariable UUID postId,
            @PathVariable UUID commentId,
            @RequestBody CommentLikeRequest likeRequest,
            Authentication authentication) {
        // Ensure the commentId in the request matches the path variable
        likeRequest.setCommentId(commentId);
        
        // Process the single like
        commentService.processBatchLikes(List.of(likeRequest), authentication.getName());
        
        // Return the updated like status
        Long likeCount = redisCommentLikeService.getLikeCount(commentId);
        boolean hasLiked = redisCommentLikeService.hasUserLiked(commentId, authentication.getName());
        
        CommentLikeResponse response = CommentLikeResponse.builder()
                .commentId(commentId)
                .likeCount(likeCount)
                .hasLiked(hasLiked)
                .build();
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{commentId}/likes")
    public ResponseEntity<CommentLikeResponse> getLikeStatus(
            @PathVariable UUID postId,
            @PathVariable UUID commentId,
            Authentication authentication) {
        Long likeCount = redisCommentLikeService.getLikeCount(commentId);
        boolean hasLiked = redisCommentLikeService.hasUserLiked(commentId, authentication.getName());
        
        CommentLikeResponse response = CommentLikeResponse.builder()
                .commentId(commentId)
                .likeCount(likeCount)
                .hasLiked(hasLiked)
                .build();
        
        return ResponseEntity.ok(response);
    }
} 