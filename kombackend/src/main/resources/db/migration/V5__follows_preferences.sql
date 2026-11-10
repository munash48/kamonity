CREATE TABLE user_follows (
  follow_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  follower_user_id BIGINT NOT NULL,
  followed_user_id BIGINT NOT NULL,
  notify_posts BOOLEAN NOT NULL DEFAULT TRUE,
  notify_comments BOOLEAN NOT NULL DEFAULT TRUE,
  notify_votes BOOLEAN NOT NULL DEFAULT TRUE,
  notify_reports BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT uk_user_follows_pair UNIQUE (follower_user_id, followed_user_id),
  CONSTRAINT fk_follows_follower FOREIGN KEY (follower_user_id) REFERENCES users(id),
  CONSTRAINT fk_follows_followed FOREIGN KEY (followed_user_id) REFERENCES users(id)
);
CREATE TABLE user_settings (
  user_id BIGINT NOT NULL PRIMARY KEY,
  mute_wallet_reminders BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_user_settings_user FOREIGN KEY (user_id) REFERENCES users(id)
);
