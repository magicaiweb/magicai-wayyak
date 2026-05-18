-- WAYYAK Phase 1 — Plain PostgreSQL schema
-- Use this for the MagicAI Postgres server, not Supabase.
-- Currency: SAR stored in halalas. Commission: 18%.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS btree_gist;

DO $$ BEGIN CREATE TYPE user_role AS ENUM ('seeker','owner','admin','ksu_admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE space_type AS ENUM ('office','boardroom','restaurant','gym','studio','event_hall','rooftop','training_room','wellness'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE space_status AS ENUM ('draft','pending_approval','approved','rejected','suspended'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE booking_status AS ENUM ('pending_payment','confirmed','cancelled','completed','refunded','no_show'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE payment_status AS ENUM ('pending','paid','failed','refunded','partially_refunded'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE payout_status AS ENUM ('scheduled','processing','paid','failed','cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE notification_channel AS ENUM ('internal_log','sms','whatsapp'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE notification_status AS ENUM ('queued','sent','failed','delivered'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION is_saudi_phone(phone text)
RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
  SELECT phone ~ '^\+966[0-9]{9}$';
$$;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role NOT NULL DEFAULT 'seeker',
  full_name text NOT NULL,
  phone text NOT NULL UNIQUE CHECK (is_saudi_phone(phone)),
  email text UNIQUE,
  password_hash text,
  avatar_url text,
  preferred_locale text NOT NULL DEFAULT 'ar' CHECK (preferred_locale IN ('ar','en')),
  is_phone_verified boolean NOT NULL DEFAULT false,
  is_email_verified boolean NOT NULL DEFAULT false,
  is_ksu_verified boolean NOT NULL DEFAULT false,
  ksu_email text UNIQUE CHECK (ksu_email IS NULL OR lower(ksu_email) LIKE '%@ksu.edu.sa'),
  telegram_user_id bigint UNIQUE,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL CHECK (is_saudi_phone(phone)),
  code_hash text NOT NULL,
  purpose text NOT NULL CHECK (purpose IN ('login','signup','verify_phone')),
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS otp_codes_phone_idx ON otp_codes(phone, purpose, expires_at);

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  user_agent text,
  ip_address inet,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);

CREATE TABLE IF NOT EXISTS ksu_incubator_startups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text NOT NULL,
  contact_email text NOT NULL CHECK (lower(contact_email) LIKE '%@ksu.edu.sa'),
  contact_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  free_hours_per_month integer NOT NULL DEFAULT 0 CHECK (free_hours_per_month >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS ksu_incubator_startups_set_updated_at ON ksu_incubator_startups;
CREATE TRIGGER ksu_incubator_startups_set_updated_at BEFORE UPDATE ON ksu_incubator_startups FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status space_status NOT NULL DEFAULT 'draft',
  type space_type NOT NULL,
  title_ar text NOT NULL,
  title_en text NOT NULL,
  description_ar text NOT NULL,
  description_en text NOT NULL,
  address_ar text NOT NULL,
  address_en text NOT NULL,
  city_ar text NOT NULL DEFAULT 'الرياض',
  city_en text NOT NULL DEFAULT 'Riyadh',
  district_ar text,
  district_en text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  capacity integer NOT NULL CHECK (capacity > 0),
  hourly_price_halalas integer NOT NULL CHECK (hourly_price_halalas >= 0),
  daily_price_halalas integer CHECK (daily_price_halalas IS NULL OR daily_price_halalas >= 0),
  min_booking_minutes integer NOT NULL DEFAULT 60 CHECK (min_booking_minutes >= 60),
  max_booking_minutes integer CHECK (max_booking_minutes IS NULL OR max_booking_minutes >= min_booking_minutes),
  commission_bps integer NOT NULL DEFAULT 1800 CHECK (commission_bps BETWEEN 0 AND 10000),
  ksu_student_discount_bps integer NOT NULL DEFAULT 5000 CHECK (ksu_student_discount_bps BETWEEN 0 AND 10000),
  allows_ksu_free_slots boolean NOT NULL DEFAULT false,
  is_ksu_campus boolean NOT NULL DEFAULT false,
  approved_by uuid REFERENCES users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS spaces_owner_id_idx ON spaces(owner_id);
CREATE INDEX IF NOT EXISTS spaces_status_type_idx ON spaces(status, type);
CREATE INDEX IF NOT EXISTS spaces_city_en_idx ON spaces(city_en);
DROP TRIGGER IF EXISTS spaces_set_updated_at ON spaces;
CREATE TRIGGER spaces_set_updated_at BEFORE UPDATE ON spaces FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS space_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_key text,
  alt_ar text,
  alt_en text,
  sort_order integer NOT NULL DEFAULT 0,
  is_cover boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(space_id, file_url)
);
CREATE INDEX IF NOT EXISTS space_photos_space_id_idx ON space_photos(space_id);

CREATE TABLE IF NOT EXISTS amenities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO amenities (code, name_ar, name_en) VALUES
('wifi','واي فاي','WiFi'),('projector','بروجكتور','Projector'),('whiteboard','سبورة','Whiteboard'),
('air_conditioning','تكييف','Air conditioning'),('kitchen_access','استخدام المطبخ','Kitchen access'),
('printer','طابعة','Printer'),('tv_screen','شاشة تلفاز','TV screen'),('video_conferencing','مؤتمرات فيديو','Video conferencing'),
('parking','مواقف سيارات','Parking'),('prayer_room','مصلى','Prayer room'),('reception_service','خدمة استقبال','Reception service'),
('coffee_machine','آلة قهوة','Coffee machine'),('standing_desks','مكاتب وقوف','Standing desks')
ON CONFLICT (code) DO UPDATE SET name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en;

CREATE TABLE IF NOT EXISTS space_amenities (
  space_id uuid NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  amenity_id uuid NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  PRIMARY KEY(space_id, amenity_id)
);

CREATE TABLE IF NOT EXISTS availability_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_time > start_time),
  UNIQUE(space_id, day_of_week, start_time, end_time)
);
CREATE INDEX IF NOT EXISTS availability_rules_space_day_idx ON availability_rules(space_id, day_of_week);

CREATE TABLE IF NOT EXISTS availability_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  reason_ar text,
  reason_en text,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at),
  EXCLUDE USING gist (space_id WITH =, tstzrange(starts_at, ends_at, '[)') WITH &&)
);
CREATE INDEX IF NOT EXISTS availability_blocks_space_time_idx ON availability_blocks(space_id, starts_at, ends_at);

CREATE TABLE IF NOT EXISTS blackout_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid REFERENCES spaces(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  reason_ar text NOT NULL,
  reason_en text NOT NULL,
  is_ksu_wide boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at),
  CHECK ((is_ksu_wide = true AND space_id IS NULL) OR (is_ksu_wide = false AND space_id IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS blackout_dates_time_idx ON blackout_dates(starts_at, ends_at);
CREATE INDEX IF NOT EXISTS blackout_dates_space_idx ON blackout_dates(space_id);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number text NOT NULL UNIQUE DEFAULT ('WY-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  space_id uuid NOT NULL REFERENCES spaces(id) ON DELETE RESTRICT,
  seeker_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status booking_status NOT NULL DEFAULT 'pending_payment',
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  guest_count integer NOT NULL DEFAULT 1 CHECK (guest_count > 0),
  currency text NOT NULL DEFAULT 'SAR' CHECK (currency = 'SAR'),
  subtotal_halalas integer NOT NULL CHECK (subtotal_halalas >= 0),
  discount_halalas integer NOT NULL DEFAULT 0 CHECK (discount_halalas >= 0),
  total_halalas integer NOT NULL CHECK (total_halalas >= 0),
  commission_halalas integer NOT NULL CHECK (commission_halalas >= 0),
  owner_payout_halalas integer NOT NULL CHECK (owner_payout_halalas >= 0),
  cancellation_refund_halalas integer CHECK (cancellation_refund_halalas IS NULL OR cancellation_refund_halalas >= 0),
  cancelled_at timestamptz,
  cancellation_reason text,
  completed_at timestamptz,
  ksu_discount_applied boolean NOT NULL DEFAULT false,
  ksu_free_slot_applied boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at),
  CHECK (extract(epoch FROM (ends_at - starts_at)) >= 3600),
  CHECK (total_halalas = greatest(subtotal_halalas - discount_halalas, 0)),
  CHECK (owner_id <> seeker_id),
  EXCLUDE USING gist (space_id WITH =, tstzrange(starts_at, ends_at, '[)') WITH &&)
    WHERE (status IN ('pending_payment','confirmed','completed'))
);
CREATE INDEX IF NOT EXISTS bookings_space_time_idx ON bookings(space_id, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS bookings_seeker_idx ON bookings(seeker_id);
CREATE INDEX IF NOT EXISTS bookings_owner_idx ON bookings(owner_id);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings(status);
DROP TRIGGER IF EXISTS bookings_set_updated_at ON bookings;
CREATE TRIGGER bookings_set_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'manual_internal' CHECK (provider IN ('manual_internal','moyasar')),
  provider_payment_id text UNIQUE,
  method text CHECK (method IN ('mada','stc_pay','apple_pay','visa','mastercard')),
  status payment_status NOT NULL DEFAULT 'pending',
  amount_halalas integer NOT NULL CHECK (amount_halalas >= 0),
  refunded_halalas integer NOT NULL DEFAULT 0 CHECK (refunded_halalas >= 0),
  paid_at timestamptz,
  refunded_at timestamptz,
  raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (refunded_halalas <= amount_halalas)
);
DROP TRIGGER IF EXISTS payments_set_updated_at ON payments;
CREATE TRIGGER payments_set_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status payout_status NOT NULL DEFAULT 'scheduled',
  amount_halalas integer NOT NULL CHECK (amount_halalas >= 0),
  scheduled_for timestamptz NOT NULL,
  paid_at timestamptz,
  provider_reference text,
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS payouts_owner_status_idx ON payouts(owner_id, status);
DROP TRIGGER IF EXISTS payouts_set_updated_at ON payouts;
CREATE TRIGGER payouts_set_updated_at BEFORE UPDATE ON payouts FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  channel notification_channel NOT NULL,
  status notification_status NOT NULL DEFAULT 'queued',
  recipient_phone text NOT NULL CHECK (is_saudi_phone(recipient_phone)),
  template_key text NOT NULL,
  locale text NOT NULL DEFAULT 'ar' CHECK (locale IN ('ar','en')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  provider_message_id text,
  error_message text,
  sent_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_booking_idx ON notifications(booking_id);
CREATE INDEX IF NOT EXISTS notifications_status_idx ON notifications(status);
DROP TRIGGER IF EXISTS notifications_set_updated_at ON notifications;
CREATE TRIGGER notifications_set_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  space_id uuid NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  seeker_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reviews_space_idx ON reviews(space_id);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_table text NOT NULL,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_logs_actor_idx ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS audit_logs_entity_idx ON audit_logs(entity_table, entity_id);

CREATE OR REPLACE FUNCTION calculate_booking_amounts(
  p_space_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_is_ksu_student boolean DEFAULT false,
  p_is_ksu_free_slot boolean DEFAULT false
)
RETURNS TABLE (
  subtotal_halalas integer,
  discount_halalas integer,
  total_halalas integer,
  commission_halalas integer,
  owner_payout_halalas integer
)
LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_space spaces%ROWTYPE;
  v_hours numeric;
BEGIN
  SELECT * INTO v_space FROM spaces WHERE id = p_space_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Space not found'; END IF;
  IF p_ends_at <= p_starts_at THEN RAISE EXCEPTION 'Invalid booking time range'; END IF;
  IF extract(epoch FROM (p_ends_at - p_starts_at)) < 3600 THEN RAISE EXCEPTION 'Minimum booking is 1 hour'; END IF;

  v_hours := extract(epoch FROM (p_ends_at - p_starts_at)) / 3600.0;
  subtotal_halalas := ceil(v_hours * v_space.hourly_price_halalas)::integer;

  IF p_is_ksu_free_slot AND v_space.allows_ksu_free_slots THEN
    discount_halalas := subtotal_halalas;
  ELSIF p_is_ksu_student THEN
    discount_halalas := floor(subtotal_halalas * v_space.ksu_student_discount_bps / 10000.0)::integer;
  ELSE
    discount_halalas := 0;
  END IF;

  total_halalas := greatest(subtotal_halalas - discount_halalas, 0);
  commission_halalas := floor(total_halalas * v_space.commission_bps / 10000.0)::integer;
  owner_payout_halalas := greatest(total_halalas - commission_halalas, 0);
  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION calculate_cancellation_refund(
  p_booking_id uuid,
  p_cancelled_at timestamptz DEFAULT now()
)
RETURNS integer LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_booking bookings%ROWTYPE;
BEGIN
  SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Booking not found'; END IF;
  IF p_cancelled_at <= v_booking.starts_at - interval '48 hours' THEN
    RETURN v_booking.total_halalas;
  END IF;
  RETURN floor(v_booking.total_halalas * 0.5)::integer;
END;
$$;

CREATE OR REPLACE VIEW admin_booking_analytics AS
SELECT
  date_trunc('day', b.created_at) AS day,
  count(*) AS bookings_count,
  sum(b.total_halalas) AS gross_revenue_halalas,
  sum(b.commission_halalas) AS wayyak_commission_halalas,
  sum(b.owner_payout_halalas) AS owner_payout_halalas,
  count(*) FILTER (WHERE b.status = 'confirmed') AS confirmed_count,
  count(*) FILTER (WHERE b.status = 'cancelled') AS cancelled_count
FROM bookings b
GROUP BY 1
ORDER BY 1 DESC;

CREATE OR REPLACE VIEW public_space_cards AS
SELECT
  s.id,
  s.type,
  s.title_ar,
  s.title_en,
  s.city_ar,
  s.city_en,
  s.district_ar,
  s.district_en,
  s.capacity,
  s.hourly_price_halalas,
  s.is_ksu_campus,
  coalesce(avg(r.rating), 0)::numeric(2,1) AS rating,
  count(r.id)::integer AS review_count,
  (SELECT sp.file_url FROM space_photos sp WHERE sp.space_id = s.id ORDER BY sp.is_cover DESC, sp.sort_order ASC LIMIT 1) AS cover_photo_url
FROM spaces s
LEFT JOIN reviews r ON r.space_id = s.id
WHERE s.status = 'approved'
GROUP BY s.id;

COMMIT;
