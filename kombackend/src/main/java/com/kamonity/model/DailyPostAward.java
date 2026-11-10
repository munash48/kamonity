package com.kamonity.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name="daily_post_awards")
public class DailyPostAward {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(name="award_date",nullable=false,unique=true) private LocalDate awardDate;
 @OneToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="post_id",nullable=false,unique=true) private Post post;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="winner_user_id",nullable=false) private User winner;
 @Column(nullable=false) private int points=5;
 @Column(name="awarded_at",nullable=false,updatable=false) private Instant awardedAt=Instant.now();
 protected DailyPostAward(){}
 public DailyPostAward(LocalDate date,Post post,User winner){this.awardDate=date;this.post=post;this.winner=winner;}
 public Long getId(){return id;} public LocalDate getAwardDate(){return awardDate;} public Post getPost(){return post;} public User getWinner(){return winner;} public int getPoints(){return points;} public Instant getAwardedAt(){return awardedAt;}
}
