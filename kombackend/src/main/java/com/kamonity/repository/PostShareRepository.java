package com.kamonity.repository;
import com.kamonity.model.PostShare;
import org.springframework.data.jpa.repository.JpaRepository;
public interface PostShareRepository extends JpaRepository<PostShare,Long>{ boolean existsByUser_IdAndPost_Id(Long userId,Long postId); }
