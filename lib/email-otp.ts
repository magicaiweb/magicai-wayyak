import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { wayyakDb } from './db'

export type WayyakRole = 'seeker' | 'owner' | 'admin' | 'ksu_admin'

const OTP_TTL_MINUTES = 10
const MAX_ATTEMPTS = 5
const staffRoles: WayyakRole[] = ['owner', 'admin', 'ksu_admin']

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function assertRoleAccess(role: WayyakRole, email: string) {
  if (!isValidEmail(email)) throw new Error('Enter a valid email address.')
  if (role === 'ksu_admin' && !email.endsWith('@ksu.edu.sa')) {
    throw new Error('KSU Admin login requires an @ksu.edu.sa email.')
  }
}

function codeHash(code: string, email: string) {
  const secret = process.env.OTP_SECRET || process.env.NEXTAUTH_SECRET || 'wayyak-local-dev-secret'
  return crypto.createHmac('sha256', secret).update(`${normalizeEmail(email)}:${code}`).digest('hex')
}

function sessionHash(token: string) {
  const secret = process.env.OTP_SECRET || process.env.NEXTAUTH_SECRET || 'wayyak-local-dev-secret'
  return crypto.createHmac('sha256', secret).update(token).digest('hex')
}

export function generateOtp() {
  return crypto.randomInt(100000, 999999).toString()
}

async function sendOtpEmail(email: string, code: string) {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.OTP_FROM_EMAIL || user

  if (!host || !from) {
    throw new Error('SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, OTP_FROM_EMAIL.')
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  })

  await transporter.sendMail({
    from,
    to: email,
    subject: 'Your WAYYAK login code',
    text: `Your WAYYAK one-time login code is ${code}. It expires in ${OTP_TTL_MINUTES} minutes.`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>WAYYAK login code</h2><p>Your one-time code is:</p><p style="font-size:28px;font-weight:800;letter-spacing:6px">${code}</p><p>This code expires in ${OTP_TTL_MINUTES} minutes.</p></div>`,
  })
}

export async function requestEmailOtp(emailInput: string, role: WayyakRole) {
  const email = normalizeEmail(emailInput)
  assertRoleAccess(role, email)

  const user = await wayyakDb.query<{ id: string; role: WayyakRole }>('SELECT id, role FROM users WHERE lower(email) = lower($1) LIMIT 1', [email])
  const existingRole = user.rows[0]?.role

  if (staffRoles.includes(role) && existingRole && existingRole !== role) {
    throw new Error(`This email is registered as ${existingRole}. Select the correct portal.`)
  }

  if (staffRoles.includes(role) && !existingRole) {
    await wayyakDb.query(
      `INSERT INTO users (role, full_name, email, is_email_verified, is_ksu_verified)
       VALUES ($1, 'WAYYAK Staff', $2, false, $3)
       ON CONFLICT (email) DO NOTHING`,
      [role, email, role === 'ksu_admin'],
    )
  }

  const code = generateOtp()
  await wayyakDb.query(
    `INSERT INTO email_otp_codes (email, role, code_hash, purpose, expires_at)
     VALUES ($1, $2, $3, $4, now() + ($5 || ' minutes')::interval)`,
    [email, role, codeHash(code, email), user.rows[0] ? 'login' : 'signup', OTP_TTL_MINUTES],
  )

  await sendOtpEmail(email, code)
  return { ok: true, expiresInMinutes: OTP_TTL_MINUTES }
}

export async function verifyEmailOtp(emailInput: string, role: WayyakRole, code: string) {
  const email = normalizeEmail(emailInput)
  assertRoleAccess(role, email)

  const otp = await wayyakDb.query<{ id: string; code_hash: string; attempts: number }>(
    `SELECT id, code_hash, attempts
     FROM email_otp_codes
     WHERE lower(email) = lower($1) AND role = $2 AND consumed_at IS NULL AND expires_at > now()
     ORDER BY created_at DESC
     LIMIT 1`,
    [email, role],
  )

  const row = otp.rows[0]
  if (!row) throw new Error('OTP expired or not found. Request a new code.')
  if (row.attempts >= MAX_ATTEMPTS) throw new Error('Too many attempts. Request a new code.')

  await wayyakDb.query('UPDATE email_otp_codes SET attempts = attempts + 1 WHERE id = $1', [row.id])
  if (row.code_hash !== codeHash(code, email)) throw new Error('Wrong OTP code.')

  const upsert = await wayyakDb.query<{ id: string; role: WayyakRole }>(
    `INSERT INTO users (role, full_name, email, is_email_verified, is_ksu_verified, last_login_at)
     VALUES ($1, 'WAYYAK User', $2, true, $3, now())
     ON CONFLICT (email) DO UPDATE SET
       role = CASE WHEN users.role = 'seeker' THEN EXCLUDED.role ELSE users.role END,
       is_email_verified = true,
       is_ksu_verified = users.is_ksu_verified OR EXCLUDED.is_ksu_verified,
       last_login_at = now(),
       updated_at = now()
     RETURNING id, role`,
    [role, email, role === 'ksu_admin'],
  )

  await wayyakDb.query('UPDATE email_otp_codes SET consumed_at = now() WHERE id = $1', [row.id])

  const token = crypto.randomBytes(32).toString('base64url')
  await wayyakDb.query(
    `INSERT INTO sessions (user_id, token_hash, role, expires_at)
     VALUES ($1, $2, $3, now() + interval '30 days')`,
    [upsert.rows[0].id, sessionHash(token), upsert.rows[0].role],
  )

  return { token, role: upsert.rows[0].role, email }
}
