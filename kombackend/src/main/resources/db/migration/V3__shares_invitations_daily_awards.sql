CREATE TABLE post_shares (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  post_id BIGINT NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT uk_post_share_user_post UNIQUE(user_id, post_id),
  CONSTRAINT fk_post_share_user FOREIGN KEY(user_id) REFERENCES users(id),
  CONSTRAINT fk_post_share_post FOREIGN KEY(post_id) REFERENCES posts(id)
);
CREATE TABLE invitations (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  inviter_user_id BIGINT NOT NULL,
  invited_email VARCHAR(255) NULL,
  invited_phone VARCHAR(40) NULL,
  invite_code VARCHAR(80) NOT NULL UNIQUE,
  registered_user_id BIGINT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  registered_at TIMESTAMP(6) NULL,
  CONSTRAINT fk_invite_inviter FOREIGN KEY(inviter_user_id) REFERENCES users(id),
  CONSTRAINT fk_invite_registered FOREIGN KEY(registered_user_id) REFERENCES users(id),
  INDEX idx_invite_email (invited_email)
);
CREATE TABLE daily_post_awards (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  award_date DATE NOT NULL UNIQUE,
  post_id BIGINT NOT NULL UNIQUE,
  winner_user_id BIGINT NOT NULL,
  points INT NOT NULL DEFAULT 5,
  awarded_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_daily_award_post FOREIGN KEY(post_id) REFERENCES posts(id),
  CONSTRAINT fk_daily_award_user FOREIGN KEY(winner_user_id) REFERENCES users(id)
);
