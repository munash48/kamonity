CREATE TABLE notifications (
 id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 user_id BIGINT NOT NULL,
 post_id BIGINT NULL,
 activity_type VARCHAR(30) NOT NULL,
 digest_count INT NOT NULL DEFAULT 1,
 message VARCHAR(500) NOT NULL,
 deep_link VARCHAR(255) NULL,
 created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 read_at TIMESTAMP(6) NULL,
 CONSTRAINT fk_notification_user FOREIGN KEY(user_id) REFERENCES users(id),
 CONSTRAINT fk_notification_post FOREIGN KEY(post_id) REFERENCES posts(id),
 INDEX idx_notifications_user_created(user_id,created_at)
);
CREATE TABLE ad_point_wallets (
 user_id BIGINT NOT NULL PRIMARY KEY,
 balance BIGINT NOT NULL DEFAULT 0,
 updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
 CONSTRAINT fk_ad_wallet_user FOREIGN KEY(user_id) REFERENCES users(id)
);
