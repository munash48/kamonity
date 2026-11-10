package com.kamonity.repository;
import com.kamonity.model.PostReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;
import java.util.List;
public interface PostReportRepository extends JpaRepository<PostReport,Long>{
 boolean existsByPost_IdAndReporter_Id(Long postId,Long reporterId);
 long countByPost_Id(Long postId);
 long countByPost_IdAndCreatedAtAfter(Long postId,Instant since);
 List<PostReport> findAllByPost_Id(Long postId);
 java.util.Optional<PostReport> findByPost_IdAndReporter_Id(Long postId,Long reporterId);
}
