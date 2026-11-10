package com.kamonity.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="user_follows", uniqueConstraints=@UniqueConstraint(name="uk_user_follows_pair", columnNames={"follower_user_id","followed_user_id"}))
public class UserFollow {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="follow_id") private Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="follower_user_id",nullable=false) private User follower;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="followed_user_id",nullable=false) private User followed;
 @Column(name="notify_posts",nullable=false) private boolean notifyPosts=true;
 @Column(name="notify_comments",nullable=false) private boolean notifyComments=true;
 @Column(name="notify_votes",nullable=false) private boolean notifyVotes=true;
 @Column(name="notify_reports",nullable=false) private boolean notifyReports=true;
 @Column(name="created_at",nullable=false,updatable=false) private Instant createdAt=Instant.now();
 protected UserFollow(){}
 public UserFollow(User follower,User followed){this.follower=follower;this.followed=followed;}
 public Long getId(){return id;} public User getFollower(){return follower;} public User getFollowed(){return followed;}
 public boolean isNotifyPosts(){return notifyPosts;} public boolean isNotifyComments(){return notifyComments;} public boolean isNotifyVotes(){return notifyVotes;} public boolean isNotifyReports(){return notifyReports;} public Instant getCreatedAt(){return createdAt;}
 public void update(Boolean posts,Boolean comments,Boolean votes,Boolean reports){if(posts!=null)notifyPosts=posts;if(comments!=null)notifyComments=comments;if(votes!=null)notifyVotes=votes;if(reports!=null)notifyReports=reports;}
}
