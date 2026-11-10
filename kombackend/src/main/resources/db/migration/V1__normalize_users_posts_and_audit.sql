CREATE TABLE IF NOT EXISTS users (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL UNIQUE,
  points INT NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS posts (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  author_name VARCHAR(100) NOT NULL,
  comments INT NOT NULL DEFAULT 0,
  content TEXT NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  points INT NOT NULL DEFAULT 0,
  shares INT NOT NULL DEFAULT 0,
  vote_count INT NOT NULL DEFAULT 0
);

SET @ddl = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='users' AND column_name='created_at')=0, 'ALTER TABLE users ADD COLUMN created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)', 'SELECT 1'); PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @ddl = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='users' AND column_name='updated_at')=0, 'ALTER TABLE users ADD COLUMN updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)', 'SELECT 1'); PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @ddl = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='posts' AND column_name='updated_at')=0, 'ALTER TABLE posts ADD COLUMN updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)', 'SELECT 1'); PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @ddl = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='posts' AND column_name='author_user_id')=0, 'ALTER TABLE posts ADD COLUMN author_user_id BIGINT NULL', 'SELECT 1'); PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS post_votes (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  post_id BIGINT NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT uk_vote_user_post UNIQUE (user_id, post_id),
  CONSTRAINT fk_vote_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_vote_post FOREIGN KEY (post_id) REFERENCES posts(id)
);
CREATE TABLE IF NOT EXISTS point_transactions (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  actor_user_id BIGINT NULL,
  recipient_user_id BIGINT NOT NULL,
  post_id BIGINT NULL,
  reason VARCHAR(80) NOT NULL,
  points INT NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_point_actor FOREIGN KEY (actor_user_id) REFERENCES users(id),
  CONSTRAINT fk_point_recipient FOREIGN KEY (recipient_user_id) REFERENCES users(id),
  CONSTRAINT fk_point_post FOREIGN KEY (post_id) REFERENCES posts(id)
);
CREATE TABLE IF NOT EXISTS audit_events (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  actor_user_id BIGINT NULL,
  action VARCHAR(80) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id VARCHAR(100) NULL,
  details JSON NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_audit_actor FOREIGN KEY (actor_user_id) REFERENCES users(id)
);

UPDATE posts p JOIN users u ON u.name=p.author_name SET p.author_user_id=u.id WHERE p.author_user_id IS NULL;
SET @ddl = IF((SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_schema=DATABASE() AND table_name='posts' AND constraint_name='fk_posts_author_user')=0, 'ALTER TABLE posts ADD CONSTRAINT fk_posts_author_user FOREIGN KEY (author_user_id) REFERENCES users(id)', 'SELECT 1'); PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @ddl = IF((SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='posts' AND index_name='idx_posts_author_created')=0, 'CREATE INDEX idx_posts_author_created ON posts(author_user_id,created_at)', 'SELECT 1'); PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

INSERT INTO point_transactions(actor_user_id,recipient_user_id,post_id,reason,points,created_at)
SELECT NULL,u.id,p.id,'LEGACY_POST_POINTS',p.points,p.created_at FROM posts p JOIN users u ON u.id=p.author_user_id
WHERE p.points<>0 AND NOT EXISTS (SELECT 1 FROM point_transactions t WHERE t.post_id=p.id AND t.reason='LEGACY_POST_POINTS');
UPDATE users u SET u.points=COALESCE((SELECT SUM(t.points) FROM point_transactions t WHERE t.recipient_user_id=u.id),0);
