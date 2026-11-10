package com.kamonity.controller;

import com.kamonity.model.*;
import com.kamonity.repository.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

@RestController
@RequestMapping("/api/v1/posts")
public class ShareController {
 private final PostRepository posts; private final UserRepository users; private final PostShareRepository shares; private final PointTransactionRepository points; private final AuditEventRepository audit; private final com.kamonity.service.NotificationService notificationService;
 public ShareController(PostRepository posts,UserRepository users,PostShareRepository shares,PointTransactionRepository points,AuditEventRepository audit,com.kamonity.service.NotificationService notificationService){this.posts=posts;this.users=users;this.shares=shares;this.points=points;this.audit=audit;this.notificationService=notificationService;}
 @PostMapping("/{postId}/share") @Transactional
 public ShareResponse share(@PathVariable Long postId,@Valid @RequestBody ShareRequest request){
  User sharer=users.findById(request.userId()).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"User not found"));
  Post post=posts.findById(postId).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Post not found"));
  if(shares.existsByUser_IdAndPost_Id(sharer.getId(),postId)) throw new ResponseStatusException(HttpStatus.CONFLICT,"This user has already shared this post");
  try{shares.saveAndFlush(new PostShare(sharer,post));}catch(DataIntegrityViolationException ex){throw new ResponseStatusException(HttpStatus.CONFLICT,"This user has already shared this post");}
  User author=post.getAuthor()!=null?post.getAuthor():users.findByName(post.getAuthorName()).orElseThrow(()->new ResponseStatusException(HttpStatus.CONFLICT,"Author is not linked"));
  post.incrementShares(); sharer.awardPoint(); author.addPoints(2);
  points.save(new PointTransaction(sharer,sharer,post,"POST_SHARED",1));
  points.save(new PointTransaction(sharer,author,post,"POST_SHARE_RECEIVED",2));
  audit.save(new AuditEvent(sharer,"POST_SHARED","POST",postId.toString(),"{}"));
  try{notificationService.bufferActivity(sharer.getId(),postId,"SHARE");}catch(Exception ignored){}
  return new ShareResponse(postId,sharer.getPoints(),author.getPoints());
 }
 public record ShareRequest(@NotNull Long userId){}
 public record ShareResponse(Long postId,int sharerPoints,int authorPoints){}
}
