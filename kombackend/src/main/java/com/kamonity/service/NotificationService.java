package com.kamonity.service;

import com.kamonity.model.*;
import com.kamonity.repository.*;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
public class NotificationService {
 private static final String PENDING="kommunity:notification:pending";
 private final StringRedisTemplate redis; private final UserRepository users; private final UserFollowRepository follows; private final PostRepository posts; private final NotificationRepository notifications; private final AdPointWalletRepository wallets; private final UserSettingsRepository settings;
 public NotificationService(StringRedisTemplate redis,UserRepository users,UserFollowRepository follows,PostRepository posts,NotificationRepository notifications,AdPointWalletRepository wallets,UserSettingsRepository settings){this.redis=redis;this.users=users;this.follows=follows;this.posts=posts;this.notifications=notifications;this.wallets=wallets;this.settings=settings;}
 public void bufferActivity(Long actorId,Long postId,String type){
  if(!List.of("POST","COMMENT","VOTE","SHARE","REPORT").contains(type))throw new IllegalArgumentException("Unsupported activity type");
  Post post=posts.findById(postId).orElseThrow();
  for(UserFollow follow:follows.findAllByFollowed_Id(actorId))if(wants(follow,type)){
   String recipient=follow.getFollower().getId().toString();String item=recipient+":"+postId+":"+type;String key="kommunity:notification:10m:"+item;
   Long count=redis.opsForValue().increment(key);if(count!=null&&count==1){redis.expire(key,Duration.ofMinutes(10));redis.opsForSet().add(PENDING,item);}
  }
 }
 private boolean wants(UserFollow f,String type){return switch(type){case "POST","SHARE"->f.isNotifyPosts();case "COMMENT"->f.isNotifyComments();case "VOTE"->f.isNotifyVotes();case "REPORT"->f.isNotifyReports();default->false;};}
 @Scheduled(fixedDelay=30000,initialDelay=30000)
 @Transactional public int flushDigests(){
  try{return flushDigestsSafely();}catch(org.springframework.data.redis.RedisConnectionFailureException unavailable){return 0;}
 }
 @Transactional public int flushDigestsSafely(){
  var keys=redis.opsForSet().members(PENDING);if(keys==null||keys.isEmpty())return 0;int emitted=0;
  for(String item:keys){String[] p=item.split(":");if(p.length!=3)continue;String key="kommunity:notification:10m:"+item;Long ttl=redis.getExpire(key);if(ttl!=null&&ttl>0)continue;String raw=redis.opsForValue().get(key);redis.opsForSet().remove(PENDING,item);if(raw==null){redis.delete(key);continue;}
   long recipientId=Long.parseLong(p[0]),postId=Long.parseLong(p[1]);String type=p[2];User recipient=users.findById(recipientId).orElse(null);Post post=posts.findById(postId).orElse(null);if(recipient!=null&&post!=null){int count=Integer.parseInt(raw);String message=count==1?"New "+type.toLowerCase()+" activity on a post you follow":count+" "+type.toLowerCase()+" activities on a post you follow";notifications.save(new Notification(recipient,post,type,count,message));emitted++;}redis.delete(key);
  }return emitted;
 }
 @Scheduled(fixedDelay=172800000)
 @Transactional public int sendWalletReminders(){int sent=0;for(AdPointWallet wallet:wallets.findAll()){if(wallet.getBalance()<=0||settings.existsByUserIdAndMuteWalletRemindersTrue(wallet.getUserId()))continue;User user=users.findById(wallet.getUserId()).orElse(null);if(user==null||notifications.existsByUser_IdAndActivityTypeAndCreatedAtAfter(user.getId(),"AD_POINTS_REMINDER",Instant.now().minus(Duration.ofDays(2))))continue;notifications.save(new Notification(user,null,"AD_POINTS_REMINDER",1,"You have idle ad points ready to use.",null));sent++;}return sent;}
}
