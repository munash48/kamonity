package com.kamonity.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "posts")
public class Post {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 100) private String authorName;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "author_user_id") @com.fasterxml.jackson.annotation.JsonIgnore private User author;
    @Column(nullable = false, columnDefinition = "TEXT") private String content;
    @Column(nullable = false) private int points = 1;
    @Column(nullable = false) private int voteCount = 0;
    @Column(nullable = false) private int comments = 0;
    @Column(nullable = false) private int shares = 0;
    @Column(nullable = false, length = 32) private String status = "ACTIVE";
    @Column(name = "report_count", nullable = false) private int reportCount = 0;
    @Column(name = "points_frozen", nullable = false) private boolean pointsFrozen = false;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "media_asset_id") @com.fasterxml.jackson.annotation.JsonIgnore private MediaAsset mediaAsset;
    @Column(nullable = false) private LocalDateTime createdAt = LocalDateTime.now();
    @Column(nullable = false) private LocalDateTime updatedAt = LocalDateTime.now();

    protected Post() {}
    public Post(String authorName, String content, int points, int voteCount, int comments, int shares, LocalDateTime createdAt) {
        this.authorName=authorName; this.content=content; this.points=points; this.voteCount=voteCount; this.comments=comments; this.shares=shares; this.createdAt=createdAt;
    }
    public Long getId(){return id;} public String getAuthorName(){return authorName;} public String getContent(){return content;} public int getPoints(){return points;}
    public int getVotes(){return voteCount;} public int getComments(){return comments;} public int getShares(){return shares;} public LocalDateTime getCreatedAt(){return createdAt;} public LocalDateTime getUpdatedAt(){return updatedAt;}
    public String getStatus(){return status;} public int getReportCount(){return reportCount;} public boolean isPointsFrozen(){return pointsFrozen;} public boolean isVisible(){return "ACTIVE".equals(status)||"REINSTATED".equals(status);}
    public User getAuthor(){return author;} public void setAuthor(User author){this.author=author;this.authorName=author.getName();}
    public void setMediaAsset(MediaAsset asset){this.mediaAsset=asset;} public MediaAsset getMediaAsset(){return mediaAsset;}
    public void addVote(){voteCount++;points++;} public void incrementComments(){comments++;} public void incrementShares(){shares++;} public void recordReport(){reportCount++;} public void setStatus(String value){status=value;} public void freezePoints(){pointsFrozen=true;} public void unfreezePoints(){pointsFrozen=false;}
    @PreUpdate public void updateTimestamp(){updatedAt=LocalDateTime.now();}
    @com.fasterxml.jackson.annotation.JsonProperty("media") public MediaSummary getMediaSummary(){return mediaAsset==null||!"READY".equals(mediaAsset.getStatus())?null:new MediaSummary(mediaAsset.getId(),mediaAsset.getMediaType(),"/api/v1/media/files/"+mediaAsset.getStorageKey(),mediaAsset.getPosterKey()==null?null:"/api/v1/media/files/"+mediaAsset.getPosterKey(),mediaAsset.getWidth(),mediaAsset.getHeight(),mediaAsset.getDurationSeconds());}
    public record MediaSummary(Long id,String type,String url,String posterUrl,Integer width,Integer height,Double durationSeconds){}
}
