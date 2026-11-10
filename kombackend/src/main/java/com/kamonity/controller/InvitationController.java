package com.kamonity.controller;

import com.kamonity.model.*;
import com.kamonity.repository.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.ConsumptionProbe;
import io.github.bucket4j.distributed.proxy.ProxyManager;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestClient;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/v1/invitations")
public class InvitationController {
 private final UserRepository users; private final InvitationRepository invitations; private final InvitationEmailAttributionRepository emailAttributions; private final PointTransactionRepository points; private final AuditEventRepository audit; private final ObjectProvider<ProxyManager<String>> rateLimitProvider; private final JavaMailSender mail;
 @Value("${spring.mail.username:}") private String mailUsername;
 @Value("${kommunity.invites.phone-gateway:whatsapp-link}") private String phoneGateway;
 @Value("${kommunity.invites.phone-gateway-url:}") private String phoneGatewayUrl;
 @Value("${kommunity.invites.phone-gateway-token:}") private String phoneGatewayToken;
 public InvitationController(UserRepository users,InvitationRepository invitations,InvitationEmailAttributionRepository emailAttributions,PointTransactionRepository points,AuditEventRepository audit,ObjectProvider<ProxyManager<String>> rateLimitProvider,JavaMailSender mail){this.users=users;this.invitations=invitations;this.emailAttributions=emailAttributions;this.points=points;this.audit=audit;this.rateLimitProvider=rateLimitProvider;this.mail=mail;}
 @PostMapping("/send") @Transactional
 public InviteResponse send(@Valid @RequestBody InviteRequest request){
  User inviter=users.findById(request.inviterUserId()).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Inviter not found"));
  boolean email=StringUtils.hasText(request.email()), hasPhone=StringUtils.hasText(request.phone());
  if(email==hasPhone) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Provide exactly one email address or phone number");
  String key="kommunity:invite-hour:"+inviter.getId();
  String normalized=email?request.email().trim().toLowerCase(java.util.Locale.ROOT):null;
  boolean unique=normalized!=null && !emailAttributions.existsById(normalized);
  String phone=request.phone()==null?null:request.phone().trim();
  BucketConfiguration configuration=BucketConfiguration.builder().addLimit(Bandwidth.builder().capacity(1).refillIntervally(1,Duration.ofHours(1)).build()).build();
  ProxyManager<String> rateLimits=rateLimitProvider.getObject();
  Bucket bucket=rateLimits.builder().build(key,()->configuration);
  ConsumptionProbe probe=bucket.tryConsumeAndReturnRemaining(1);
  if(!probe.isConsumed()) throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"Only one invitation per user per hour is allowed");
  String code=UUID.randomUUID().toString();
  Invitation invitation=invitations.save(new Invitation(inviter,normalized,phone,code));
  String inviteUrl="http://localhost:5173/?invite="+code;
  String whatsappUrl=null;
  boolean emailSent=false;
  if(email){
    try { SimpleMailMessage message=new SimpleMailMessage(); message.setTo(normalized); message.setSubject("You are invited to KOMMUNITY"); message.setText(inviter.getName()+" invited you to join KOMMUNITY: "+inviteUrl); mail.send(message); emailSent=true; }
    catch(Exception ex){ throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Email delivery failed; verify SMTP configuration and retry"); }
  } else {
    String text=inviter.getName()+" invited you to join KOMMUNITY: "+inviteUrl;
    whatsappUrl="https://wa.me/"+phone.replaceAll("[^0-9]","")+"?text="+URLEncoder.encode(text,StandardCharsets.UTF_8);
    if(phoneGateway.equalsIgnoreCase("http") && !phoneGatewayUrl.isBlank()) {
      try {
        RestClient client=RestClient.builder().build();
        RestClient.RequestBodySpec req=client.post().uri(phoneGatewayUrl).contentType(org.springframework.http.MediaType.APPLICATION_JSON);
        if(!phoneGatewayToken.isBlank()) req=req.header(org.springframework.http.HttpHeaders.AUTHORIZATION,"Bearer "+phoneGatewayToken);
        req.body(java.util.Map.of("to",request.phone(),"message",text)).retrieve().toBodilessEntity();
        whatsappUrl=null;
      } catch(Exception failure) { throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Phone invitation gateway delivery failed"); }
    }
  }
  if(unique){
    InvitationEmailAttribution attribution=emailAttributions.findById(normalized).orElse(null);
    if(attribution==null){
      try { emailAttributions.saveAndFlush(new InvitationEmailAttribution(normalized,inviter)); inviter.awardPoint(); points.save(new PointTransaction(inviter,inviter,null,"UNIQUE_INVITATION_SENT",1)); }
      catch(org.springframework.dao.DataIntegrityViolationException duplicateAttribution){ org.springframework.transaction.interceptor.TransactionAspectSupport.currentTransactionStatus().setRollbackOnly(); throw new ResponseStatusException(HttpStatus.CONFLICT,"Concurrent invitation attribution; retry the invitation"); }
    } else { unique=false; }
  }
  audit.save(new AuditEvent(inviter,"INVITATION_SENT",email?"EMAIL":"PHONE",invitation.getId().toString(),"{\"unique\":"+unique+"}"));
  String deliveryMessage=email?(emailSent?"Invitation email sent":(mailUsername.isBlank()?"SMTP sender is not configured":"Email delivery failed; verify SMTP settings")):"http".equalsIgnoreCase(phoneGateway)&&!phoneGatewayUrl.isBlank()?"Invitation sent through configured phone gateway":"wa.me invitation prepared; user must send in WhatsApp";
  return new InviteResponse(invitation.getId(),unique,deliveryMessage,whatsappUrl);
 }
 @PostMapping("/complete-registration") @Transactional
 public InviteResponse complete(@Valid @RequestBody CompleteRegistration request){
  Invitation invitation=invitations.findByInviteCode(request.inviteCode()).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Invitation code not found"));
  if(invitation.getRegisteredUser()!=null) throw new ResponseStatusException(HttpStatus.CONFLICT,"Invitation already used");
  String registrationEmail=request.email().trim().toLowerCase(java.util.Locale.ROOT);
  if(invitation.getNormalizedEmail()==null || !invitation.getNormalizedEmail().equals(registrationEmail)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Registration email does not match the invited email");
  if(users.findByEmail(registrationEmail).isPresent()) throw new ResponseStatusException(HttpStatus.CONFLICT,"Email is already registered");
  User invitee=users.save(new User(request.name().trim(),registrationEmail)); invitation.completeRegistration(invitee);
  InvitationEmailAttribution attribution=emailAttributions.findById(registrationEmail).orElse(null);
  boolean firstAttribution=attribution!=null && attribution.getRegisteredUser()==null;
  User creditedInviter=firstAttribution?attribution.getInviter():invitation.getInviter();
  if(firstAttribution){attribution.register(invitee); creditedInviter.addPoints(2); points.save(new PointTransaction(invitee,creditedInviter,null,"INVITEE_REGISTERED",2));}
  audit.save(new AuditEvent(invitee,"INVITEE_REGISTERED","INVITATION",invitation.getId().toString(),"{\"attributed\":"+firstAttribution+"}"));
  return new InviteResponse(invitation.getId(),true,"Invite attribution completed",null);
 }
 public record InviteRequest(@NotNull Long inviterUserId,@Email String email,@Pattern(regexp="^[+0-9() .-]{7,40}$") String phone){}
 public record CompleteRegistration(@NotNull String inviteCode,@NotNull String name,@Email String email){}
 public record InviteResponse(Long invitationId,boolean unique,String message,String whatsappUrl){}
}
