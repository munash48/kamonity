package com.kamonity.repository;
import com.kamonity.model.PostComment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface PostCommentRepository extends JpaRepository<PostComment,Long>{
  @org.springframework.data.jpa.repository.EntityGraph(attributePaths = "author")
  List<PostComment> findAllByPostIdOrderByCreatedAtAsc(Long postId);
  long countByPostId(Long postId);
}
