package com.kamonity.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="point_transactions")
public class PointTransaction {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="actor_user_id") private User actor;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="recipient_user_id", nullable=false) private User recipient;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="post_id") private Post post;
    @Column(nullable=false, length=80) private String reason;
    @Column(nullable=false) private int points;
    @Column(name="created_at", nullable=false, updatable=false) private Instant createdAt=Instant.now();
    protected PointTransaction() {}
    public PointTransaction(User actor, User recipient, Post post, String reason, int points){this.actor=actor;this.recipient=recipient;this.post=post;this.reason=reason;this.points=points;}
    public Long getId(){return id;}
    public User getActor(){return actor;}
    public User getRecipient(){return recipient;}
    public Post getPost(){return post;}
    public String getReason(){return reason;}
    public int getPoints(){return points;}
    public Instant getCreatedAt(){return createdAt;}
}
