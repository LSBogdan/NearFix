package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.like.LikeUpdateMessage;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WebSocketLikeService {
    private final SimpMessagingTemplate messagingTemplate;
    private final RedisLikeService redisLikeService;

    public void broadcastLikeUpdate(UUID postId) {
        Long likeCount = redisLikeService.getLikeCount(postId);
        LikeUpdateMessage message = new LikeUpdateMessage(postId, likeCount);
        messagingTemplate.convertAndSend("/topic/likes/" + postId, message);
    }
}