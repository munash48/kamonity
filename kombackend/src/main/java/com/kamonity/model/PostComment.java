package com.kamonity.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="post_comments", indexes=@Index(name="idx_comments_post_created", columnList="post_id,created_at"))
public class PostComment {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="post_id",nullable=false) private Post post;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id",nullable=false) private User author;
    @Column(nullable=false,length=2000) private String content;
    @Column(name="created_at",nullable=false,updatable=false) private Instant createdAt=Instant.now();
    protected PostComment(){}
    public PostComment(Post post,User author,String content){this.post=post;this.author=author;this.content=content;}
    public Long getId(){return id;}
    public Post getPost(){return post;}
    public User getAuthor(){return author;}
    public String getAuthorName(){return author.getName();}
    public String getContent(){return content;}
    public Instant getCreatedAt(){return createdAt;}
}
