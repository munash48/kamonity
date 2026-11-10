package com.kamonity.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="invitation_email_attributions")
public class InvitationEmailAttribution {
 @Id @Column(name="normalized_email",length=255) private String normalizedEmail;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="inviter_user_id",nullable=false) private User inviter;
 @Column(name="created_at",nullable=false,updatable=false) private Instant createdAt=Instant.now();
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="registered_user_id") private User registeredUser;
 @Column(name="registered_at") private Instant registeredAt;
 protected InvitationEmailAttribution(){}
 public InvitationEmailAttribution(String email,User inviter){this.normalizedEmail=email;this.inviter=inviter;}
 public String getNormalizedEmail(){return normalizedEmail;}
 public User getInviter(){return inviter;}
 public Instant getCreatedAt(){return createdAt;}
 public User getRegisteredUser(){return registeredUser;}
 public void register(User user){if(registeredUser==null){registeredUser=user;registeredAt=Instant.now();}}
}
