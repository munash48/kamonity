package com.kamonity.model;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="notifications",indexes=@Index(name="idx_notifications_user_created",columnList="user_id,created_at"))
public class Notification {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id",nullable=false) private User user;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="post_id") private Post post;
 @Column(name="activity_type",nullable=false,length=30) private String activityType;
 @Column(name="digest_count",nullable=false) private int digestCount=1;
 @Column(nullable=false,length=500) private String message;
 @Column(name="deep_link",length=255) private String deepLink;
 @Column(name="created_at",nullable=false,updatable=false) private Instant createdAt=Instant.now();
 @Column(name="read_at") private Instant readAt;
 protected Notification(){}
 public Notification(User user,Post post,String type,int count,String message){this(user,post,type,count,message,post==null?null:"/posts/"+post.getId());}
 public Notification(User user,Post post,String type,int count,String message,String deepLink){this.user=user;this.post=post;this.activityType=type;this.digestCount=count;this.message=message;this.deepLink=deepLink;}
 public Long getId(){return id;} public Long getUserId(){return user.getId();} public Long getPostId(){return post==null?null:post.getId();} public String getActivityType(){return activityType;} public int getDigestCount(){return digestCount;} public String getMessage(){return message;} public String getDeepLink(){return deepLink;} public Instant getCreatedAt(){return createdAt;} public Instant getReadAt(){return readAt;}
 public void increment(String newMessage){digestCount++;message=newMessage;createdAt=Instant.now();}
 public void markRead(){readAt=Instant.now();}
}
