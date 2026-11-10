package com.kamonity.repository;
import com.kamonity.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
public interface PostRepository extends JpaRepository<Post,Long>{
 List<Post> findAllByOrderByCreatedAtDesc();
 List<Post> findAllByOrderByPointsDesc();
 Optional<Post> findFirstByCreatedAtBetweenOrderByVoteCountDescCreatedAtAsc(LocalDateTime start,LocalDateTime end);
}
