package com.kamonity.model;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="ad_point_wallets")
public class AdPointWallet {
 @Id @Column(name="user_id") private Long userId;
 @MapsId @OneToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id") private User user;
 @Column(nullable=false) private long balance=0;
 @Column(name="updated_at",nullable=false) private Instant updatedAt=Instant.now();
 protected AdPointWallet(){}
 public AdPointWallet(User user,long balance){this.user=user;this.userId=user.getId();this.balance=balance;}
 public Long getUserId(){return userId;} public long getBalance(){return balance;} public Instant getUpdatedAt(){return updatedAt;}
}
