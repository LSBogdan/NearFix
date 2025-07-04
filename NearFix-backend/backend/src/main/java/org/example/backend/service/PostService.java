package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.like.LikeRequest;
import org.example.backend.dto.post.PostFilterRequest;
import org.example.backend.dto.post.PostRequest;
import org.example.backend.dto.post.PostResponse;
import org.example.backend.entity.Post;
import org.example.backend.entity.Role;
import org.example.backend.entity.User;
import org.example.backend.exception.post.InvalidPostDataException;
import org.example.backend.exception.post.PostNotFoundException;
import org.example.backend.exception.user.UserNotFoundException;
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
public class PostService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final RedisLikeService redisLikeService;
    private final WebSocketLikeService webSocketLikeService;

    @Transactional
    public PostResponse createPost(PostRequest request, String userEmail) {
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new InvalidPostDataException("Title cannot be empty");
        }
        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            throw new InvalidPostDataException("Description cannot be empty");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        Post post = new Post();
        post.setTitle(request.getTitle().trim());
        post.setDescription(request.getDescription().trim());
        post.setUser(user);
        post.setUpvotes(0);
        post.setCreationDate(LocalDate.now());
        post.setIsEdited(false);

        post = postRepository.save(post);

        // Initialize Redis cache for the new post
        redisLikeService.syncLikeCount(post.getPostId(), 0L);

        return mapToPostResponse(post);
    }

    public Page<PostResponse> getAllPosts(PostFilterRequest filterRequest) {
        String sortBy = mapSortField(filterRequest.getSortBy());
        Sort.Direction direction = Sort.Direction.fromString(filterRequest.getSortDirection());
        Pageable pageable = PageRequest.of(
                filterRequest.getPage(),
                filterRequest.getSize(),
                Sort.by(direction, sortBy)
        );

        Page<Post> posts = postRepository.findAllWithFilter(
                filterRequest.getSearchTerm(),
                pageable
        );

        return posts.map(this::mapToPostResponse);
    }

    public PostResponse getPost(UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException(postId));
        return mapToPostResponse(post);
    }

    @Transactional
    public PostResponse updatePost(UUID postId, PostRequest request, String userEmail) {
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new InvalidPostDataException("Title cannot be empty");
        }
        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            throw new InvalidPostDataException("Description cannot be empty");
        }

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException(postId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        if (!post.getUser().getUserId().equals(user.getUserId()) && user.getRole() != Role.ADMIN) {
            throw new RuntimeException("You don't have permission to update this post");
        }

        post.setTitle(request.getTitle().trim());
        post.setDescription(request.getDescription().trim());
        post.setIsEdited(true);

        post = postRepository.save(post);
        return mapToPostResponse(post);
    }

    @Transactional
    public void deletePost(UUID postId, String userEmail) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException(postId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        if (!post.getUser().getUserId().equals(user.getUserId()) && user.getRole() != Role.ADMIN) {
            throw new RuntimeException("You don't have permission to delete this post");
        }

        // The comments will be automatically deleted due to the @OneToMany relationship
        // with cascade = CascadeType.ALL in the Post entity
        postRepository.delete(post);
    }

    @Transactional
    public void processBatchLikes(List<LikeRequest> likes, String username) {
        // Group likes by post to minimize database operations
        Map<UUID, Long> postLikeCounts = new java.util.HashMap<>();
        
        for (LikeRequest like : likes) {
            if (like.isLike()) {
                redisLikeService.incrementLike(like.getPostId(), username);
                postLikeCounts.merge(like.getPostId(), 1L, Long::sum);
            } else {
                redisLikeService.decrementLike(like.getPostId(), username);
                postLikeCounts.merge(like.getPostId(), -1L, Long::sum);
            }
        }

        // Update posts in bulk and broadcast updates
        for (Map.Entry<UUID, Long> entry : postLikeCounts.entrySet()) {
            UUID postId = entry.getKey();
            Long countChange = entry.getValue();
            
            // Get current upvotes from database
            Post post = postRepository.findById(postId).orElse(null);
            if (post != null) {
                int newUpvotes = post.getUpvotes() + countChange.intValue();
                postRepository.updateUpvotes(postId, newUpvotes);
                
                // Sync the updated count back to Redis to ensure consistency
                redisLikeService.syncLikeCount(postId, (long) newUpvotes);
                
                // Broadcast the update via WebSocket
                webSocketLikeService.broadcastLikeUpdate(postId);
            }
        }
    }

    @Scheduled(fixedRate = 300000) // Run every 5 minutes
    @Transactional
    public void syncLikesWithDatabase() {
        // Get all posts and sync their like counts with Redis
        List<Post> posts = postRepository.findAll();
        for (Post post : posts) {
            redisLikeService.syncLikeCount(post.getPostId(), (long) post.getUpvotes());
        }
    }

    private String mapSortField(String field) {
        return switch (field) {
            case "creationDate" -> "creation_date";
            case "upvotes" -> "upvotes";
            case "title" -> "title";
            case "description" -> "description";
            default -> "creation_date";
        };
    }

    private PostResponse mapToPostResponse(Post post) {
        // Use Redis like count for real-time accuracy, fallback to database count
        Long redisLikeCount = redisLikeService.getLikeCount(post.getPostId());
        int upvotes = redisLikeCount != null ? redisLikeCount.intValue() : post.getUpvotes();
        
        return PostResponse.builder()
                .postId(post.getPostId())
                .title(post.getTitle())
                .description(post.getDescription())
                .upvotes(upvotes)
                .creationDate(post.getCreationDate())
                .authorName(post.getUser().getFirstName() + " " + post.getUser().getLastName())
                .authorId(post.getUser().getUserId())
                .authorEmail(post.getUser().getEmail())
                .isEdited(post.getIsEdited())
                .build();
    }
} 