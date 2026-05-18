import 'dotenv/config'
import pg from 'pg'

const { Client } = pg
const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('DATABASE_URL is required')
  process.exit(1)
}

const client = new Client({ connectionString: databaseUrl })

const upsertUser = async (user) => {
  const { rows } = await client.query(
    `INSERT INTO users (role, full_name, phone, email, preferred_locale, is_phone_verified, is_email_verified, is_ksu_verified, ksu_email)
     VALUES ($1,$2,$3,$4,'ar',true,true,true,$5)
     ON CONFLICT (phone) DO UPDATE SET
       role = EXCLUDED.role,
       full_name = EXCLUDED.full_name,
       email = EXCLUDED.email,
       is_phone_verified = true,
       is_email_verified = true,
       is_ksu_verified = true,
       ksu_email = EXCLUDED.ksu_email,
       updated_at = now()
     RETURNING id`,
    [user.role, user.fullName, user.phone, user.email, user.ksuEmail],
  )
  return rows[0].id
}

const spaceRows = [
  {
    type: 'boardroom',
    titleAr: 'قاعة اجتماعات الحاضنة',
    titleEn: 'Incubation Boardroom',
    descriptionAr: 'قاعة حديثة لاجتماعات الفرق والعروض.',
    descriptionEn: 'Modern boardroom for teams and pitch sessions.',
    addressAr: 'جامعة الملك سعود، مركز ريادة الأعمال',
    addressEn: 'KSU Entrepreneurship Center',
    districtAr: 'الدرعية',
    districtEn: 'Diriyah',
    capacity: 12,
    hourly: 12000,
    daily: 75000,
    freeSlots: true,
    amenities: ['wifi','projector','whiteboard','air_conditioning','video_conferencing','coffee_machine','parking','prayer_room'],
  },
  {
    type: 'training_room',
    titleAr: 'قاعة تدريب KSU',
    titleEn: 'KSU Training Room',
    descriptionAr: 'مساحة تدريب مرنة بورشة كاملة.',
    descriptionEn: 'Flexible training space for workshops.',
    addressAr: 'جامعة الملك سعود، مبنى الحاضنة',
    addressEn: 'KSU Incubator Building',
    districtAr: 'الرياض',
    districtEn: 'Riyadh',
    capacity: 30,
    hourly: 18000,
    daily: 110000,
    freeSlots: true,
    amenities: ['wifi','projector','whiteboard','air_conditioning','printer','parking','prayer_room','reception_service'],
  },
  {
    type: 'studio',
    titleAr: 'استوديو محتوى جامعي',
    titleEn: 'Campus Content Studio',
    descriptionAr: 'استوديو صغير لتسجيل المحتوى والبودكاست.',
    descriptionEn: 'Compact studio for content and podcast recording.',
    addressAr: 'جامعة الملك سعود، منطقة الابتكار',
    addressEn: 'KSU Innovation Zone',
    districtAr: 'الرياض',
    districtEn: 'Riyadh',
    capacity: 6,
    hourly: 9000,
    daily: 55000,
    freeSlots: false,
    amenities: ['wifi','air_conditioning','tv_screen','video_conferencing','parking','coffee_machine'],
  },
]

try {
  await client.connect()
  await client.query('BEGIN')

  const adminId = await upsertUser({ role: 'ksu_admin', fullName: 'KSU Incubation Admin', phone: '+966500000001', email: 'admin@ksu.edu.sa', ksuEmail: 'admin@ksu.edu.sa' })
  const ownerId = await upsertUser({ role: 'owner', fullName: 'KSU Campus Spaces', phone: '+966500000002', email: 'spaces@ksu.edu.sa', ksuEmail: 'spaces@ksu.edu.sa' })
  const seekerId = await upsertUser({ role: 'seeker', fullName: 'Demo KSU Student', phone: '+966500000003', email: 'student@ksu.edu.sa', ksuEmail: 'student@ksu.edu.sa' })

  await client.query(
    `INSERT INTO ksu_incubator_startups (name_ar, name_en, contact_email, contact_user_id, free_hours_per_month, is_active)
     SELECT 'شركة ناشئة تجريبية - حاضنة جامعة الملك سعود', 'Demo KSU Incubator Startup', 'student@ksu.edu.sa', $1, 20, true
     WHERE NOT EXISTS (SELECT 1 FROM ksu_incubator_startups WHERE contact_email = 'student@ksu.edu.sa')`,
    [seekerId],
  )

  for (const space of spaceRows) {
    const { rows } = await client.query(
      `WITH inserted AS (
        INSERT INTO spaces (
          owner_id, status, type, title_ar, title_en, description_ar, description_en,
          address_ar, address_en, district_ar, district_en, capacity, hourly_price_halalas,
          daily_price_halalas, allows_ksu_free_slots, is_ksu_campus, approved_by, approved_at
        )
        SELECT $1, 'approved', $2::space_type, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, true, $15, now()
        WHERE NOT EXISTS (SELECT 1 FROM spaces WHERE title_en = $4)
        RETURNING id
      )
      SELECT id FROM inserted
      UNION ALL
      SELECT id FROM spaces WHERE title_en = $4
      LIMIT 1`,
      [ownerId, space.type, space.titleAr, space.titleEn, space.descriptionAr, space.descriptionEn, space.addressAr, space.addressEn, space.districtAr, space.districtEn, space.capacity, space.hourly, space.daily, space.freeSlots, adminId],
    )
    const spaceId = rows[0].id

    await client.query(
      `INSERT INTO space_amenities (space_id, amenity_id)
       SELECT $1, id FROM amenities WHERE code = ANY($2::text[])
       ON CONFLICT DO NOTHING`,
      [spaceId, space.amenities],
    )

    await client.query(
      `INSERT INTO availability_rules (space_id, day_of_week, start_time, end_time, is_available)
       SELECT $1, day_of_week, TIME '09:00', TIME '21:00', true
       FROM generate_series(0, 4) AS day_of_week
       ON CONFLICT DO NOTHING`,
      [spaceId],
    )
  }

  await client.query(
    `INSERT INTO blackout_dates (starts_at, ends_at, reason_ar, reason_en, is_ksu_wide, created_by)
     SELECT TIMESTAMPTZ '2026-06-01 00:00:00+03', TIMESTAMPTZ '2026-06-15 23:59:59+03', 'فترة اختبارات جامعة الملك سعود', 'KSU exam period', true, $1
     WHERE NOT EXISTS (SELECT 1 FROM blackout_dates WHERE is_ksu_wide = true AND reason_en = 'KSU exam period')`,
    [adminId],
  )

  await client.query(
    `INSERT INTO notifications (user_id, channel, status, recipient_phone, template_key, locale, payload)
     SELECT $1, 'internal_log', 'queued', '+966500000001', 'phase1_seed_complete', 'en', '{"source":"seed","message":"WAYYAK Phase 1 seed data created"}'::jsonb
     WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE template_key = 'phase1_seed_complete')`,
    [adminId],
  )

  const { rows } = await client.query(`
    SELECT
      (SELECT count(*)::int FROM users WHERE phone LIKE '+96650000000%') AS demo_users,
      (SELECT count(*)::int FROM spaces WHERE is_ksu_campus = true) AS ksu_spaces,
      (SELECT count(*)::int FROM amenities) AS amenities,
      (SELECT count(*)::int FROM availability_rules) AS availability_rules,
      (SELECT count(*)::int FROM blackout_dates WHERE is_ksu_wide = true) AS blackout_dates,
      (SELECT count(*)::int FROM notifications WHERE channel = 'internal_log') AS internal_notifications
  `)

  await client.query('COMMIT')
  console.log('WAYYAK KSU demo seed complete:', rows[0])
} catch (error) {
  await client.query('ROLLBACK').catch(() => {})
  throw error
} finally {
  await client.end()
}
