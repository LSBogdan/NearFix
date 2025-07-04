package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.comment.CommentFilterRequest;
import org.example.backend.dto.comment.CommentRequest;
import org.example.backend.dto.comment.CommentResponse;
import org.example.backend.dto.commentlike.CommentLikeRequest;
import org.example.backend.entity.Comment;
import org.example.backend.entity.Post;
import org.example.backend.entity.Role;
import org.example.backend.entity.User;
import org.example.backend.exception.comment.CommentNotFoundException;
import org.example.backend.exception.post.PostNotFoundException;
import org.example.backend.exception.user.UserNotFoundException;
import org.example.backend.repository.CommentRepository;
import org.example.backend.repository.PostRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final RedisCommentLikeService redisCommentLikeService;
    private final WebSocketCommentLikeService webSocketCommentLikeService;

    @Transactional
    public CommentResponse createComment(UUID postId, CommentRequest request, String userEmail) {
        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            throw new RuntimeException("Description cannot be empty");
        }

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException(postId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        Comment comment = new Comment();
        comment.setDescription(request.getDescription().trim());
        comment.setUser(user);
        comment.setPost(post);
        comment.setUpvotes(0);
        comment.setCreationDate(LocalDate.now());
        comment.setIsEdited(false);

        comment = commentRepository.save(comment);

        // Initialize Redis cache for the new comment
        redisCommentLikeService.syncLikeCount(comment.getCommentId(), 0L);

        return mapToCommentResponse(comment, userEmail);
    }

    public Page<CommentResponse> getCommentsForPost(UUID postId, CommentFilterRequest filterRequest, String userEmail) {
        if (!postRepository.existsById(postId)) {
            throw new PostNotFoundException(postId);
        }

        String sortBy = mapSortField(filterRequest.getSortBy());
        Sort.Direction direction = Sort.Direction.fromString(filterRequest.getSortDirection());
        Pageable pageable = PageRequest.of(
                filterRequest.getPage(),
                filterRequest.getSize(),
                Sort.by(direction, sortBy)
        );

        Page<Comment> comments = commentRepository.findAllByPostIdWithFilter(
                postId,
                filterRequest.getSearchTerm(),
                pageable
        );

        return comments.map(comment -> mapToCommentResponse(comment, userEmail));
    }

    private String mapSortField(String field) {
        return switch (field) {
            case "creationDate" -> "creation_date";
            case "upvotes" -> "upvotes";
            case "description" -> "description";
            default -> "creation_date";
        };
    }

    private CommentResponse mapToCommentResponse(Comment comment, String userEmail) {
        // Use Redis like count for real-time accuracy, fallback to database count
        Long redisLikeCount = redisCommentLikeService.getLikeCount(comment.getCommentId());
        int upvotes = redisLikeCount != null ? redisLikeCount.intValue() : comment.getUpvotes();
        
        // Check if user has liked this comment
        boolean hasLiked = userEmail != null && redisCommentLikeService.hasUserLiked(comment.getCommentId(), userEmail);
        
        return CommentResponse.builder()
                .commentId(comment.getCommentId())
                .description(comment.getDescription())
                .upvotes(upvotes)
                .creationDate(comment.getCreationDate())
                .authorName(comment.getUser().getFirstName() + " " + comment.getUser().getLastName())
                .authorId(comment.getUser().getUserId())
                .authorEmail(comment.getUser().getEmail())
                .postId(comment.getPost().getPostId())
                .isEdited(comment.getIsEdited())
                .hasLiked(hasLiked)
                .build();
    }

    public List<CommentResponse> getPostComments(UUID postId, String userEmail) {
        if (!postRepository.existsById(postId)) {
            throw new PostNotFoundException(postId);
        }

        return commentRepository.findByPost_PostIdOrderByCreationDateDesc(postId)
                .stream()
                .map(comment -> mapToCommentResponse(comment, userEmail))
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentResponse updateComment(UUID commentId, CommentRequest request, String userEmail) {
        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            throw new RuntimeException("Description cannot be empty");
        }

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException(commentId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        if (!comment.getUser().getUserId().equals(user.getUserId()) && user.getRole() != Role.ADMIN) {
            throw new RuntimeException("You don't have permission to update this comment");
        }

        comment.setDescription(request.getDescription().trim());
        comment.setIsEdited(true);
        comment = commentRepository.save(comment);
        return mapToCommentResponse(comment, userEmail);
    }

    @Transactional
    public void deleteComment(UUID commentId, String userEmail) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException(commentId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        if (!comment.getUser().getUserId().equals(user.getUserId()) && user.getRole() != Role.ADMIN) {
            throw new RuntimeException("You don't have permission to delete this comment");
        }

        // Clear Redis cache for this comment
        redisCommentLikeService.clearCommentLikes(commentId);
        
        commentRepository.delete(comment);
    }

    @Transactional
    public void processBatchLikes(List<CommentLikeRequest> likes, String username) {
        // Group likes by comment to minimize database operations
        Map<UUID, Long> commentLikeCounts = new java.util.HashMap<>();
        
        for (CommentLikeRequest like : likes) {
            if (like.isLike()) {
                redisCommentLikeService.incrementLike(like.getCommentId(), username);
                commentLikeCounts.merge(like.getCommentId(), 1L, Long::sum);
            } else {
                redisCommentLikeService.decrementLike(like.getCommentId(), username);
                commentLikeCounts.merge(like.getCommentId(), -1L, Long::sum);
            }
        }

        // Update comments in bulk and broadcast updates
        for (Map.Entry<UUID, Long> entry : commentLikeCounts.entrySet()) {
            UUID commentId = entry.getKey();
            Long countChange = entry.getValue();
            
            // Get current upvotes from database
            Comment comment = commentRepository.findById(commentId).orElse(null);
            if (comment != null) {
                int newUpvotes = comment.getUpvotes() + countChange.intValue();
                commentRepository.updateUpvotes(commentId, newUpvotes);
                
                // Sync the updated count back to Redis to ensure consistency
                redisCommentLikeService.syncLikeCount(commentId, (long) newUpvotes);
                
                // Broadcast the update via WebSocket
                webSocketCommentLikeService.broadcastLikeUpdate(commentId);
            }
        }
    }

    @Scheduled(fixedRate = 300000) 
    @Transactional
    public void syncLikesWithDatabase() {
        List<Comment> comments = commentRepository.findAll();
        for (Comment comment : comments) {
            redisCommentLikeService.syncLikeCount(comment.getCommentId(), (long) comment.getUpvotes());
        }
    }
} 