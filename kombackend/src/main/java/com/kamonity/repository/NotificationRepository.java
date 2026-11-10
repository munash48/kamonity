package com.kamonity.repository;

import com.kamonity.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.Instant;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification,Long> {
    List<Notification> findTop5ByUser_IdAndReadAtIsNullOrderByCreatedAtDesc(Long userId);
    long countByUser_IdAndReadAtIsNull(Long userId);
    boolean existsByUser_IdAndActivityTypeAndCreatedAtAfter(Long userId,String activityType,Instant after);
    @Modifying
    @Query("update Notification n set n.readAt=:now where n.user.id=:userId and n.id in :ids and n.readAt is null")
    int markViewed(@Param("userId") Long userId,@Param("ids") List<Long> ids,@Param("now") Instant now);
}
