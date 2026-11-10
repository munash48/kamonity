package com.kamonity.repository;
import com.kamonity.model.UserSettings;
import org.springframework.data.jpa.repository.JpaRepository;
public interface UserSettingsRepository extends JpaRepository<UserSettings,Long>{
 boolean existsByUserIdAndMuteWalletRemindersTrue(Long userId);
}
