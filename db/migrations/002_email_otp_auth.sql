-- WAYYAK Phase 2 — Email OTP auth for public users and staff/admin.

BEGIN;

ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE users ALTER COLUMN full_name SET DEFAULT 'WAYYAK User';

CREATE TABLE IF NOT EXISTS email_otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role user_role NOT NULL DEFAULT 'seeker',
  code_hash text NOT NULL,
  purpose text NOT NULL CHECK (purpose IN ('login','signup')),
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_otp_codes_lookup_idx
  ON email_otp_codes(lower(email), role, purpose, expires_at DESC)
  WHERE consumed_at IS NULL;

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS role user_role;

COMMIT;
