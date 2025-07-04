package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.commentlike.CommentLikeUpdateMessage;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WebSocketCommentLikeService {
    private final SimpMessagingTemplate messagingTemplate;
    private final RedisCommentLikeService redisCommentLikeService;

    public void broadcastLikeUpdate(UUID commentId) {
        Long likeCount = redisCommentLikeService.getLikeCount(commentId);
        CommentLikeUpdateMessage message = new CommentLikeUpdateMessage(commentId, likeCount);
        messagingTemplate.convertAndSend("/topic/comment-likes/" + commentId, message);
    }
} 