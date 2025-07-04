package org.example.backend.repository;

import org.example.backend.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {
    @Query(value = "SELECT * FROM posts p WHERE " +
           "(:searchTerm IS NULL OR " +
           "LOWER(p.title::text) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.description::text) LIKE LOWER(CONCAT('%', :searchTerm, '%')))",
           nativeQuery = true)
    Page<Post> findAllWithFilter(@Param("searchTerm") String searchTerm, Pageable pageable);

    @Modifying
    @Query("UPDATE Post p SET p.upvotes = :count WHERE p.postId = :postId")
    void updateUpvotes(@Param("postId") UUID postId, @Param("count") Integer count);
} 