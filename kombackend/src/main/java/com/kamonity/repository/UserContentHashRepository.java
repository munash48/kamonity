package com.kamonity.repository;
import com.kamonity.model.UserContentHash;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;
public interface UserContentHashRepository extends JpaRepository<UserContentHash,Long>{
 boolean existsByUser_IdAndContentHashAndCreatedAtAfter(Long userId,String hash,Instant since);
}
