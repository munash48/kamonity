package com.kamonity.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity @Table(name="user_content_hashes",indexes=@Index(name="idx_user_content_hash_time",columnList="user_id,content_hash,created_at"))
public class UserContentHash {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id",nullable=false) private User user;
 @Column(name="content_hash",nullable=false,length=64) private String contentHash;
 @Column(name="content_type",nullable=false,length=30) private String contentType="POST";
 @Column(name="content_id") private Long contentId;
 @Column(name="created_at",nullable=false,updatable=false) private Instant createdAt=Instant.now();
 protected UserContentHash(){}
 public UserContentHash(User user,String hash,String type,Long contentId){this.user=user;this.contentHash=hash;this.contentType=type;this.contentId=contentId;}
 public Long getId(){return id;} public String getContentHash(){return contentHash;} public String getContentType(){return contentType;} public Long getContentId(){return contentId;} public Instant getCreatedAt(){return createdAt;}
}
