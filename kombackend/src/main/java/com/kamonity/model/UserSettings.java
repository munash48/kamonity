package com.kamonity.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="user_settings")
public class UserSettings {
 @Id @Column(name="user_id") private Long userId;
 @MapsId @OneToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id") private User user;
 @Column(name="mute_wallet_reminders",nullable=false) private boolean muteWalletReminders=false;
 @Column(name="updated_at",nullable=false) private Instant updatedAt=Instant.now();
 protected UserSettings(){}
 public UserSettings(User user){this.user=user;this.userId=user.getId();}
 public Long getUserId(){return userId;} public boolean isMuteWalletReminders(){return muteWalletReminders;} public Instant getUpdatedAt(){return updatedAt;}
 public void setMuteWalletReminders(boolean value){muteWalletReminders=value;updatedAt=Instant.now();}
}
