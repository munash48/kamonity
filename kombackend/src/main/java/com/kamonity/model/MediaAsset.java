package com.kamonity.model;
import jakarta.persistence.*;import java.time.Instant;
@Entity @Table(name="media_assets",indexes=@Index(name="idx_media_owner_status",columnList="owner_user_id,status,created_at"))
public class MediaAsset{
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="owner_user_id",nullable=false) private User owner;
 @Column(name="media_type",nullable=false,length=16) private String mediaType;
 @Column(name="storage_key",nullable=false,unique=true) private String storageKey;
 @Column(name="poster_key") private String posterKey;
 @Column(name="original_filename",nullable=false) private String originalFilename;
 @Column(name="content_type",nullable=false) private String contentType;
 private Integer width;private Integer height;
 @Column(name="duration_seconds",columnDefinition="DECIMAL(8,3)") private Double durationSeconds;
 @Column(nullable=false,length=16) private String status;
 @Column(name="failure_reason",length=500) private String failureReason;
 @Column(name="created_at",nullable=false,updatable=false) private Instant createdAt=Instant.now();
 @Column(name="updated_at",nullable=false) private Instant updatedAt=Instant.now();
 protected MediaAsset(){}
 public MediaAsset(User owner,String type,String key,String original,String mime,String status){this.owner=owner;mediaType=type;storageKey=key;originalFilename=original;contentType=mime;this.status=status;}
 public Long getId(){return id;}public User getOwner(){return owner;}public String getMediaType(){return mediaType;}public String getStorageKey(){return storageKey;}public String getPosterKey(){return posterKey;}public String getOriginalFilename(){return originalFilename;}public String getContentType(){return contentType;}public Integer getWidth(){return width;}public Integer getHeight(){return height;}public Double getDurationSeconds(){return durationSeconds;}public String getStatus(){return status;}public String getFailureReason(){return failureReason;}public Instant getCreatedAt(){return createdAt;}
 public void complete(String key,String poster,int w,int h,Double duration){storageKey=key;posterKey=poster;width=w;height=h;durationSeconds=duration;status="READY";updatedAt=Instant.now();}
 public void fail(String reason){status="FAILED";failureReason=reason==null?"Media processing failed":reason.substring(0,Math.min(490,reason.length()));updatedAt=Instant.now();}
}
