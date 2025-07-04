package org.example.backend.repository;

import org.example.backend.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {
    List<Comment> findByPost_PostId(UUID postId);
    List<Comment> findByPost_PostIdOrderByCreationDateDesc(UUID postId);

    @Query(value = "SELECT * FROM comments c WHERE c.post_id = :postId AND " +
           "(:searchTerm IS NULL OR " +
           "LOWER(c.description::text) LIKE LOWER(CONCAT('%', :searchTerm, '%')))",
           nativeQuery = true)
    Page<Comment> findAllByPostIdWithFilter(
            @Param("postId") UUID postId,
            @Param("searchTerm") String searchTerm,
            Pageable pageable);

    @Modifying
    @Query("UPDATE Comment c SET c.upvotes = :count WHERE c.commentId = :commentId")
    void updateUpvotes(@Param("commentId") UUID commentId, @Param("count") Integer count);
} 