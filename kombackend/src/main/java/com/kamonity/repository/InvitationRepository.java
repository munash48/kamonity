package com.kamonity.repository;
import com.kamonity.model.Invitation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface InvitationRepository extends JpaRepository<Invitation,Long>{
 Optional<Invitation> findFirstByNormalizedEmail(String normalizedEmail);
 Optional<Invitation> findByInviteCode(String inviteCode);
 boolean existsByInviteCode(String inviteCode);
}
