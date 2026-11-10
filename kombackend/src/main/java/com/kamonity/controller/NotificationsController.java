package com.kamonity.controller;

import com.kamonity.model.Notification;
import com.kamonity.repository.NotificationRepository;
import com.kamonity.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/users/{userId}/notifications")
public class NotificationsController {
 private final UserRepository users; private final NotificationRepository notifications;
 public NotificationsController(UserRepository users,NotificationRepository notifications){this.users=users;this.notifications=notifications;}
 @GetMapping public Batch unreadBatch(@PathVariable Long userId){requireUser(userId);return new Batch(notifications.findTop5ByUser_IdAndReadAtIsNullOrderByCreatedAtDesc(userId).stream().map(this::item).toList(),notifications.countByUser_IdAndReadAtIsNull(userId));}
 @PostMapping("/mark-viewed") @Transactional public Batch markViewed(@PathVariable Long userId,@Valid @RequestBody MarkViewed body){requireUser(userId);List<Long> ids=body.ids().stream().distinct().limit(5).toList();if(!ids.isEmpty())notifications.markViewed(userId,ids,Instant.now());return unreadBatch(userId);}
 private void requireUser(Long id){if(!users.existsById(id))throw new ResponseStatusException(HttpStatus.NOT_FOUND,"User not found");}
 private Item item(Notification n){return new Item(n.getId(),n.getPostId(),n.getActivityType(),n.getDigestCount(),n.getMessage(),n.getDeepLink(),n.getCreatedAt(),n.getReadAt());}
 public record MarkViewed(@NotEmpty List<@NotNull Long> ids){}
 public record Item(Long id,Long postId,String activityType,int digestCount,String message,String deepLink,Instant createdAt,Instant readAt){}
 public record Batch(List<Item> items,long unreadCount){}
}
