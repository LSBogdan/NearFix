package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.like.LikeRequest;
import org.example.backend.dto.like.LikeResponse;
import org.example.backend.dto.post.PostFilterRequest;
import org.example.backend.dto.post.PostRequest;
import org.example.backend.dto.post.PostResponse;
import org.example.backend.service.PostService;
import org.example.backend.service.RedisLikeService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;
    private final RedisLikeService redisLikeService;

    @PostMapping
    public ResponseEntity<PostResponse> createPost(
            @RequestBody PostRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(postService.createPost(request, authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<Page<PostResponse>> getAllPosts(PostFilterRequest filterRequest) {
        return ResponseEntity.ok(postService.getAllPosts(filterRequest));
    }

    @GetMapping("/{postId}")
    public ResponseEntity<PostResponse> getPost(@PathVariable UUID postId) {
        return ResponseEntity.ok(postService.getPost(postId));
    }

    @PutMapping("/{postId}")
    public ResponseEntity<PostResponse> updatePost(
            @PathVariable UUID postId,
            @RequestBody PostRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(postService.updatePost(postId, request, authentication.getName()));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(
            @PathVariable UUID postId,
            Authentication authentication) {
        postService.deletePost(postId, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/likes/batch")
    public ResponseEntity<Void> processBatchLikes(
            @RequestBody List<LikeRequest> likes,
            Authentication authentication) {
        postService.processBatchLikes(likes, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<LikeResponse> toggleLike(
            @PathVariable UUID postId,
            @RequestBody LikeRequest likeRequest,
            Authentication authentication) {
        // Ensure the postId in the request matches the path variable
        likeRequest.setPostId(postId);
        
        // Process the single like
        postService.processBatchLikes(List.of(likeRequest), authentication.getName());
        
        // Return the updated like status
        Long likeCount = redisLikeService.getLikeCount(postId);
        boolean hasLiked = redisLikeService.hasUserLiked(postId, authentication.getName());
        
        LikeResponse response = LikeResponse.builder()
                .postId(postId)
                .likeCount(likeCount)
                .hasLiked(hasLiked)
                .build();
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{postId}/likes")
    public ResponseEntity<LikeResponse> getLikeStatus(
            @PathVariable UUID postId,
            Authentication authentication) {
        Long likeCount = redisLikeService.getLikeCount(postId);
        boolean hasLiked = redisLikeService.hasUserLiked(postId, authentication.getName());
        
        LikeResponse response = LikeResponse.builder()
                .postId(postId)
                .likeCount(likeCount)
                .hasLiked(hasLiked)
                .build();
        
        return ResponseEntity.ok(response);
    }
} 