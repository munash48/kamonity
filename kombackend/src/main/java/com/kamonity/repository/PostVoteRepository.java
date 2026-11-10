package com.kamonity.repository;
import com.kamonity.model.PostVote;
import org.springframework.data.jpa.repository.JpaRepository;
public interface PostVoteRepository extends JpaRepository<PostVote,Long> {
    boolean existsByUser_IdAndPost_Id(Long userId, Long postId);
    java.util.List<PostVote> findAllByUserId(Long userId);
}
