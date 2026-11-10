package com.kamonity.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="post_votes", uniqueConstraints=@UniqueConstraint(name="uk_vote_user_post", columnNames={"user_id","post_id"}))
public class PostVote {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="user_id", nullable=false) private User user;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="post_id", nullable=false) private Post post;
    @Column(name="created_at", nullable=false, updatable=false) private Instant createdAt=Instant.now();
    protected PostVote() {}
    public PostVote(User user, Post post) { this.user=user; this.post=post; }
    public Long getId(){return id;}
    public User getUser(){return user;}
    public Post getPost(){return post;}
    public Long getPostId(){return post == null ? null : post.getId();}
    public Instant getCreatedAt(){return createdAt;}
}
