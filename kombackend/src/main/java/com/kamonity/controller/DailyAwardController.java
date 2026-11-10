package com.kamonity.controller;

import com.kamonity.model.*;
import com.kamonity.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/gamification")
public class DailyAwardController {
 private final PostRepository posts; private final UserRepository users; private final DailyPostAwardRepository awards; private final PointTransactionRepository transactions; private final AuditEventRepository audit;
 public DailyAwardController(PostRepository posts,UserRepository users,DailyPostAwardRepository awards,PointTransactionRepository transactions,AuditEventRepository audit){this.posts=posts;this.users=users;this.awards=awards;this.transactions=transactions;this.audit=audit;}
 @Scheduled(cron="0 5 0 * * *",zone="UTC")
 public void awardYesterdayScheduled(){
  try { awardYesterday(); } catch(ResponseStatusException ignored) { }
 }

 @PostMapping("/best-post-of-day") @Transactional
 public Map<String,Object> awardYesterday(){
  LocalDate today=LocalDate.now(ZoneOffset.UTC), yesterday=today.minusDays(1);
  if(awards.existsByAwardDate(yesterday)) throw new ResponseStatusException(HttpStatus.CONFLICT,"Daily award already issued");
  LocalDateTime start=yesterday.atStartOfDay(), end=today.atStartOfDay();
  Post winner=posts.findFirstByCreatedAtBetweenOrderByVoteCountDescCreatedAtAsc(start,end).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"No posts to award for yesterday"));
  User author=winner.getAuthor()!=null?winner.getAuthor():users.findByName(winner.getAuthorName()).orElseThrow(()->new ResponseStatusException(HttpStatus.CONFLICT,"Post author is not linked"));
  awards.save(new DailyPostAward(yesterday,winner,author)); author.addPoints(5); transactions.save(new PointTransaction(null,author,winner,"BEST_POST_OF_DAY",5)); audit.save(new AuditEvent(null,"BEST_POST_OF_DAY","POST",winner.getId().toString(),"{\"awardDate\":\""+yesterday+"\"}"));
  return Map.of("awardDate",yesterday.toString(),"postId",winner.getId(),"winner",author.getName(),"points",author.getPoints());
 }
}
