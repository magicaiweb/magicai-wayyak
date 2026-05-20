import 'dotenv/config'
import crypto from 'node:crypto'
import http from 'node:http'
import nodemailer from 'nodemailer'
import pg from 'pg'

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 10 })
const port = Number(process.env.PORT || 3020)
const ttlMinutes = 10
const maxAttempts = 5
const isProduction = process.env.NODE_ENV === 'production'
const allowDevOtp = !isProduction && process.env.ALLOW_DEV_OTP !== 'false'

const roles = new Set(['seeker', 'owner', 'admin', 'ksu_admin'])
const staffRoles = new Set(['owner', 'admin', 'ksu_admin'])
const normalizeEmail = (email) => String(email || '').trim().toLowerCase()
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
const json = (res, status, body, headers = {}) => {
  res.writeHead(status, { 'content-type': 'application/json', 'access-control-allow-origin': process.env.CORS_ORIGIN || '*', 'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'POST,OPTIONS', ...headers })
  res.end(JSON.stringify(body))
}

function assertAccess(role, email) {
  if (!roles.has(role)) throw new Error('Invalid role.')
  if (!isValidEmail(email)) throw new Error('Enter a valid email address.')
  if (role === 'ksu_admin' && !email.endsWith('@ksu.edu.sa')) throw new Error('KSU Admin login requires an @ksu.edu.sa email.')
}

function codeHash(code, email) {
  const secret = process.env.OTP_SECRET || process.env.NEXTAUTH_SECRET || 'wayyak-local-dev-secret'
  return crypto.createHmac('sha256', secret).update(`${normalizeEmail(email)}:${code}`).digest('hex')
}

function sessionHash(token) {
  const secret = process.env.OTP_SECRET || process.env.NEXTAUTH_SECRET || 'wayyak-local-dev-secret'
  return crypto.createHmac('sha256', secret).update(token).digest('hex')
}

async function sendOtpEmail(email, code) {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.OTP_FROM_EMAIL || user
  const hasSmtp = Boolean(host && from)
  if (!hasSmtp) {
    if (allowDevOtp) {
      console.log(`[WAYYAK DEV OTP] ${email}: ${code}`)
      return { delivered: false, devOtp: code }
    }
    throw new Error('SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, OTP_FROM_EMAIL.')
  }
  const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: user && pass ? { user, pass } : undefined })
  await transporter.sendMail({ from, to: email, subject: 'Your WAYYAK login code', text: `Your WAYYAK one-time login code is ${code}. It expires in ${ttlMinutes} minutes.` })
  return { delivered: true }
}

async function parseBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
}

async function requestOtp(body) {
  const email = normalizeEmail(body.email)
  const role = body.role
  assertAccess(role, email)
  const user = await pool.query('SELECT id, role FROM users WHERE lower(email) = lower($1) LIMIT 1', [email])
  const existingRole = user.rows[0]?.role
  if (staffRoles.has(role) && existingRole && existingRole !== role) throw new Error(`This email is registered as ${existingRole}. Select the correct portal.`)
  if (staffRoles.has(role) && !existingRole) {
    await pool.query(`INSERT INTO users (role, full_name, email, is_email_verified, is_ksu_verified) VALUES ($1, 'WAYYAK Staff', $2, false, $3) ON CONFLICT (email) DO NOTHING`, [role, email, role === 'ksu_admin'])
  }
  const code = crypto.randomInt(100000, 999999).toString()
  await pool.query(`INSERT INTO email_otp_codes (email, role, code_hash, purpose, expires_at) VALUES ($1, $2, $3, $4, now() + ($5 || ' minutes')::interval)`, [email, role, codeHash(code, email), user.rows[0] ? 'login' : 'signup', ttlMinutes])
  const delivery = await sendOtpEmail(email, code)
  return { ok: true, expiresInMinutes: ttlMinutes, ...(delivery.devOtp ? { devOtp: delivery.devOtp } : {}) }
}

async function verifyOtp(body) {
  const email = normalizeEmail(body.email)
  const role = body.role
  const code = String(body.code || '')
  assertAccess(role, email)
  const otp = await pool.query(`SELECT id, code_hash, attempts FROM email_otp_codes WHERE lower(email) = lower($1) AND role = $2 AND consumed_at IS NULL AND expires_at > now() ORDER BY created_at DESC LIMIT 1`, [email, role])
  const row = otp.rows[0]
  if (!row) throw new Error('OTP expired or not found. Request a new code.')
  if (row.attempts >= maxAttempts) throw new Error('Too many attempts. Request a new code.')
  await pool.query('UPDATE email_otp_codes SET attempts = attempts + 1 WHERE id = $1', [row.id])
  if (row.code_hash !== codeHash(code, email)) throw new Error('Wrong OTP code.')
  const upsert = await pool.query(`INSERT INTO users (role, full_name, email, is_email_verified, is_ksu_verified, last_login_at) VALUES ($1, 'WAYYAK User', $2, true, $3, now()) ON CONFLICT (email) DO UPDATE SET role = CASE WHEN users.role = 'seeker' THEN EXCLUDED.role ELSE users.role END, is_email_verified = true, is_ksu_verified = users.is_ksu_verified OR EXCLUDED.is_ksu_verified, last_login_at = now(), updated_at = now() RETURNING id, role`, [role, email, role === 'ksu_admin'])
  await pool.query('UPDATE email_otp_codes SET consumed_at = now() WHERE id = $1', [row.id])
  const token = crypto.randomBytes(32).toString('base64url')
  await pool.query(`INSERT INTO sessions (user_id, token_hash, role, expires_at) VALUES ($1, $2, $3, now() + interval '30 days')`, [upsert.rows[0].id, sessionHash(token), upsert.rows[0].role])
  return { ok: true, role: upsert.rows[0].role, email, token }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, {})
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' })
  try {
    const body = await parseBody(req)
    if (req.url === '/api/auth/request-otp') return json(res, 200, await requestOtp(body))
    if (req.url === '/api/auth/verify-otp') {
      const result = await verifyOtp(body)
      return json(res, 200, { ok: true, role: result.role, email: result.email }, { 'set-cookie': `wayyak_session=${result.token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24 * 30}` })
    }
    return json(res, 404, { error: 'Not found.' })
  } catch (error) {
    return json(res, 400, { error: error instanceof Error ? error.message : 'Auth request failed.' })
  }
})

server.listen(port, () => console.log(`WAYYAK email OTP API listening on :${port}`))
