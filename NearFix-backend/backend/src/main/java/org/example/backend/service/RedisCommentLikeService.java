package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RedisCommentLikeService {
    private final RedisTemplate<String, Object> redisTemplate;
    private static final String COMMENT_LIKES_KEY = "comment:likes:";
    private static final String USER_COMMENT_LIKES_KEY = "user:comment_likes:";
    private static final long CACHE_EXPIRATION = 24 * 60 * 60; // 24 hours

    public void incrementLike(UUID commentId, String username) {
        String commentKey = COMMENT_LIKES_KEY + commentId;
        String userKey = USER_COMMENT_LIKES_KEY + username;
        
        if (!hasUserLiked(commentId, username)) {
            redisTemplate.opsForValue().increment(commentKey);
            redisTemplate.opsForSet().add(userKey, commentId.toString());
            redisTemplate.expire(commentKey, CACHE_EXPIRATION, TimeUnit.SECONDS);
            redisTemplate.expire(userKey, CACHE_EXPIRATION, TimeUnit.SECONDS);
        }
    }

    public void decrementLike(UUID commentId, String username) {
        String commentKey = COMMENT_LIKES_KEY + commentId;
        String userKey = USER_COMMENT_LIKES_KEY + username;
        
        if (hasUserLiked(commentId, username)) {
            redisTemplate.opsForValue().decrement(commentKey);
            redisTemplate.opsForSet().remove(userKey, commentId.toString());
        }
    }

    public Long getLikeCount(UUID commentId) {
        String commentKey = COMMENT_LIKES_KEY + commentId;
        Object count = redisTemplate.opsForValue().get(commentKey);
        if (count != null) {
            try {
                return Long.parseLong(count.toString());
            } catch (NumberFormatException e) {
                return 0L;
            }
        }
        return 0L;
    }

    public boolean hasUserLiked(UUID commentId, String username) {
        String userKey = USER_COMMENT_LIKES_KEY + username;
        return Boolean.TRUE.equals(redisTemplate.opsForSet().isMember(userKey, commentId.toString()));
    }

    public void syncLikeCount(UUID commentId, Long count) {
        String commentKey = COMMENT_LIKES_KEY + commentId;
        redisTemplate.opsForValue().set(commentKey, count);
        redisTemplate.expire(commentKey, CACHE_EXPIRATION, TimeUnit.SECONDS);
    }

    public void clearUserLikes(String username) {
        String userKey = USER_COMMENT_LIKES_KEY + username;
        redisTemplate.delete(userKey);
    }

    public void clearCommentLikes(UUID commentId) {
        String commentKey = COMMENT_LIKES_KEY + commentId;
        redisTemplate.delete(commentKey);
    }
} 