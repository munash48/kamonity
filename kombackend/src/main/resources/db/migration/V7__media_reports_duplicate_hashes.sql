ALTER TABLE posts ADD COLUMN status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE posts ADD COLUMN report_count INT NOT NULL DEFAULT 0;
ALTER TABLE posts ADD COLUMN points_frozen BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE posts ADD COLUMN media_asset_id BIGINT NULL;
CREATE TABLE post_reports (
 id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 post_id BIGINT NOT NULL,
 reporter_user_id BIGINT NOT NULL,
 reason_code VARCHAR(40) NOT NULL,
 details VARCHAR(1000) NULL,
 points_deducted INT NOT NULL DEFAULT 0,
 created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 CONSTRAINT uk_post_report_user UNIQUE(post_id,reporter_user_id),
 CONSTRAINT fk_report_post FOREIGN KEY(post_id) REFERENCES posts(id),
 CONSTRAINT fk_report_user FOREIGN KEY(reporter_user_id) REFERENCES users(id),
 INDEX idx_report_post_time(post_id,created_at)
);
CREATE TABLE user_content_hashes (
 id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 user_id BIGINT NOT NULL,
 content_hash CHAR(64) NOT NULL,
 content_type VARCHAR(30) NOT NULL DEFAULT 'POST',
 content_id BIGINT NULL,
 created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 CONSTRAINT fk_content_hash_user FOREIGN KEY(user_id) REFERENCES users(id),
 INDEX idx_user_content_hash_time(user_id,content_hash,created_at)
);
CREATE TABLE media_assets (
 id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 owner_user_id BIGINT NOT NULL,
 media_type VARCHAR(16) NOT NULL,
 storage_key VARCHAR(255) NOT NULL UNIQUE,
 poster_key VARCHAR(255) NULL,
 original_filename VARCHAR(255) NOT NULL,
 content_type VARCHAR(100) NOT NULL,
 width INT NULL,
 height INT NULL,
 duration_seconds DECIMAL(8,3) NULL,
 status VARCHAR(16) NOT NULL,
 failure_reason VARCHAR(500) NULL,
 created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
 CONSTRAINT fk_media_owner FOREIGN KEY(owner_user_id) REFERENCES users(id),
 INDEX idx_media_owner_status(owner_user_id,status,created_at)
);
ALTER TABLE posts ADD CONSTRAINT fk_post_media_asset FOREIGN KEY(media_asset_id) REFERENCES media_assets(id);
CREATE TABLE media_daily_views (
 id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 media_asset_id BIGINT NOT NULL,
 viewer_key VARCHAR(128) NOT NULL,
 view_date DATE NOT NULL,
 created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 CONSTRAINT uk_media_view_session_day UNIQUE(media_asset_id,viewer_key,view_date),
 CONSTRAINT fk_media_view_asset FOREIGN KEY(media_asset_id) REFERENCES media_assets(id)
);
