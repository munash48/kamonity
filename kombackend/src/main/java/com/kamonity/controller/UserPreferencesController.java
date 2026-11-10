package com.kamonity.controller;

import com.kamonity.model.User;
import com.kamonity.model.UserFollow;
import com.kamonity.model.UserSettings;
import com.kamonity.repository.UserFollowRepository;
import com.kamonity.repository.UserRepository;
import com.kamonity.repository.UserSettingsRepository;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserPreferencesController {
 private final UserRepository users; private final UserFollowRepository follows; private final UserSettingsRepository settings;
 public UserPreferencesController(UserRepository users,UserFollowRepository follows,UserSettingsRepository settings){this.users=users;this.follows=follows;this.settings=settings;}
 @GetMapping("/{userId}/follows") public List<FollowResponse> follows(@PathVariable Long userId){
  requireUser(userId); return follows.findAllByFollower_Id(userId).stream().map(f->new FollowResponse(f.getFollowed().getId(),f.getFollowed().getName(),f.isNotifyPosts(),f.isNotifyComments(),f.isNotifyVotes(),f.isNotifyReports(),f.getCreatedAt())).toList();
 }
 @PutMapping("/{userId}/follows/{followedId}") @Transactional public FollowResponse updateFollow(@PathVariable Long userId,@PathVariable Long followedId,@RequestBody FollowUpdate body){
  requireUser(userId); if(userId.equals(followedId)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"A user cannot follow themselves");
  User followed=users.findById(followedId).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Followed user not found"));
  UserFollow link=follows.findByFollower_IdAndFollowed_Id(userId,followedId).orElseGet(()->new UserFollow(users.findById(userId).orElseThrow(),followed));
  link.update(body.notifyPosts(),body.notifyComments(),body.notifyVotes(),body.notifyReports()); follows.save(link);
  return new FollowResponse(followedId,followed.getName(),link.isNotifyPosts(),link.isNotifyComments(),link.isNotifyVotes(),link.isNotifyReports(),link.getCreatedAt());
 }
 @GetMapping("/{userId}/settings") public SettingsResponse getSettings(@PathVariable Long userId){requireUser(userId);UserSettings s=settings.findById(userId).orElseGet(()->settings.save(new UserSettings(users.findById(userId).orElseThrow())));return new SettingsResponse(s.getUserId(),s.isMuteWalletReminders(),s.getUpdatedAt());}
 @PutMapping("/{userId}/settings") @Transactional public SettingsResponse putSettings(@PathVariable Long userId,@RequestBody SettingsUpdate body){requireUser(userId);UserSettings s=settings.findById(userId).orElseGet(()->new UserSettings(users.findById(userId).orElseThrow()));s.setMuteWalletReminders(body.muteWalletReminders());settings.save(s);return new SettingsResponse(s.getUserId(),s.isMuteWalletReminders(),s.getUpdatedAt());}
 private void requireUser(Long id){if(!users.existsById(id))throw new ResponseStatusException(HttpStatus.NOT_FOUND,"User not found");}
 public record FollowUpdate(Boolean notifyPosts,Boolean notifyComments,Boolean notifyVotes,Boolean notifyReports){}
 public record FollowResponse(Long userId,String name,boolean notifyPosts,boolean notifyComments,boolean notifyVotes,boolean notifyReports,Instant createdAt){}
 public record SettingsUpdate(@NotNull Boolean muteWalletReminders){}
 public record SettingsResponse(Long userId,boolean muteWalletReminders,Instant updatedAt){}
}
