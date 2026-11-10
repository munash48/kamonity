ALTER TABLE invitations ADD COLUMN normalized_email VARCHAR(255) NULL;
UPDATE invitations SET normalized_email=LOWER(TRIM(invited_email)) WHERE invited_email IS NOT NULL;
CREATE INDEX idx_invitations_normalized_email ON invitations(normalized_email, created_at);
CREATE TABLE invitation_email_attributions (
  normalized_email VARCHAR(255) NOT NULL PRIMARY KEY,
  inviter_user_id BIGINT NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  registered_user_id BIGINT NULL,
  registered_at TIMESTAMP(6) NULL,
  CONSTRAINT fk_email_attribution_inviter FOREIGN KEY(inviter_user_id) REFERENCES users(id),
  CONSTRAINT fk_email_attribution_registered FOREIGN KEY(registered_user_id) REFERENCES users(id)
);
INSERT INTO invitation_email_attributions(normalized_email,inviter_user_id,created_at)
SELECT i.normalized_email, SUBSTRING_INDEX(GROUP_CONCAT(i.inviter_user_id ORDER BY i.created_at, i.id), ',', 1), MIN(i.created_at)
FROM invitations i
WHERE i.normalized_email IS NOT NULL
GROUP BY i.normalized_email;
