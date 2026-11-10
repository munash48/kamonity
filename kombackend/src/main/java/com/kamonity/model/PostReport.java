package com.kamonity.model;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="post_reports",uniqueConstraints=@UniqueConstraint(name="uk_post_report_user",columnNames={"post_id","reporter_user_id"}),indexes=@Index(name="idx_report_post_time",columnList="post_id,created_at"))
public class PostReport {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="post_id",nullable=false) private Post post;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="reporter_user_id",nullable=false) private User reporter;
 @Column(name="reason_code",nullable=false,length=40) private String reasonCode;
 @Column(length=1000) private String details;
 @Column(name="points_deducted",nullable=false) private int pointsDeducted=0;
 @Column(name="created_at",nullable=false,updatable=false) private Instant createdAt=Instant.now();
 protected PostReport(){}
 public PostReport(Post post,User reporter,String reasonCode,String details){this.post=post;this.reporter=reporter;this.reasonCode=reasonCode;this.details=details;}
 public Long getId(){return id;} public Post getPost(){return post;} public User getReporter(){return reporter;} public String getReasonCode(){return reasonCode;} public String getDetails(){return details;} public int getPointsDeducted(){return pointsDeducted;} public Instant getCreatedAt(){return createdAt;} public void deductPoint(){pointsDeducted=1;} public void restoreDeduction(){pointsDeducted=0;}
}
