package com.kamonity.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="invitations", indexes=@Index(name="idx_invite_email",columnList="invited_email"))
public class Invitation {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="inviter_user_id",nullable=false) private User inviter;
 @Column(name="invited_email") private String invitedEmail;
 @Column(name="normalized_email") private String normalizedEmail;
 @Column(name="invited_phone") private String invitedPhone;
 @Column(name="invite_code",nullable=false,unique=true) private String inviteCode;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="registered_user_id") private User registeredUser;
 @Column(name="created_at",nullable=false,updatable=false) private Instant createdAt=Instant.now();
 @Column(name="registered_at") private Instant registeredAt;
 protected Invitation(){}
 public Invitation(User inviter,String email,String phone,String code){this.inviter=inviter;this.invitedEmail=email;this.normalizedEmail=email==null?null:email.trim().toLowerCase(java.util.Locale.ROOT);this.invitedPhone=phone;this.inviteCode=code;}
 public Long getId(){return id;} public User getInviter(){return inviter;} public String getInvitedEmail(){return invitedEmail;} public String getNormalizedEmail(){return normalizedEmail;} public String getInvitedPhone(){return invitedPhone;} public String getInviteCode(){return inviteCode;} public User getRegisteredUser(){return registeredUser;} public Instant getCreatedAt(){return createdAt;} public Instant getRegisteredAt(){return registeredAt;}
 public void completeRegistration(User user){if(registeredUser!=null)throw new IllegalStateException("Invitation already attributed");registeredUser=user;registeredAt=Instant.now();}
}
