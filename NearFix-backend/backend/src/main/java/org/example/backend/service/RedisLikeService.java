package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RedisLikeService {
    private final RedisTemplate<String, Object> redisTemplate;
    private static final String POST_LIKES_KEY = "post:likes:";
    private static final String USER_LIKES_KEY = "user:likes:";
    private static final long CACHE_EXPIRATION = 24 * 60 * 60; // 24 hours

    public void incrementLike(UUID postId, String username) {
        String postKey = POST_LIKES_KEY + postId;
        String userKey = USER_LIKES_KEY + username;
        
        if (!hasUserLiked(postId, username)) {
            redisTemplate.opsForValue().increment(postKey);
            redisTemplate.opsForSet().add(userKey, postId.toString());
            redisTemplate.expire(postKey, CACHE_EXPIRATION, TimeUnit.SECONDS);
            redisTemplate.expire(userKey, CACHE_EXPIRATION, TimeUnit.SECONDS);
        }
    }

    public void decrementLike(UUID postId, String username) {
        String postKey = POST_LIKES_KEY + postId;
        String userKey = USER_LIKES_KEY + username;
        
        // Check if user has liked this post before removing
        if (hasUserLiked(postId, username)) {
            redisTemplate.opsForValue().decrement(postKey);
            redisTemplate.opsForSet().remove(userKey, postId.toString());
        }
    }

    public Long getLikeCount(UUID postId) {
        String postKey = POST_LIKES_KEY + postId;
        Object count = redisTemplate.opsForValue().get(postKey);
        if (count != null) {
            try {
                return Long.parseLong(count.toString());
            } catch (NumberFormatException e) {
                return 0L;
            }
        }
        return 0L;
    }

    public boolean hasUserLiked(UUID postId, String username) {
        String userKey = USER_LIKES_KEY + username;
        return Boolean.TRUE.equals(redisTemplate.opsForSet().isMember(userKey, postId.toString()));
    }

    public void syncLikeCount(UUID postId, Long count) {
        String postKey = POST_LIKES_KEY + postId;
        redisTemplate.opsForValue().set(postKey, count);
        redisTemplate.expire(postKey, CACHE_EXPIRATION, TimeUnit.SECONDS);
    }

    public void clearUserLikes(String username) {
        String userKey = USER_LIKES_KEY + username;
        redisTemplate.delete(userKey);
    }

    public void clearPostLikes(UUID postId) {
        String postKey = POST_LIKES_KEY + postId;
        redisTemplate.delete(postKey);
    }
}