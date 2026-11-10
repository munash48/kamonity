package com.kamonity.repository;
import com.kamonity.model.UserFollow;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface UserFollowRepository extends JpaRepository<UserFollow,Long>{
 List<UserFollow> findAllByFollower_Id(Long followerId);
 Optional<UserFollow> findByFollower_IdAndFollowed_Id(Long followerId,Long followedId);
 List<UserFollow> findAllByFollowed_Id(Long followedId);
}
