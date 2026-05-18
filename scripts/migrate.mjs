import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const { Client } = pg
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('DATABASE_URL is required')
  process.exit(1)
}

const migrationPath = path.join(__dirname, '..', 'db', 'migrations', '001_phase1_schema.sql')
const sql = await readFile(migrationPath, 'utf8')
const client = new Client({ connectionString: databaseUrl })

try {
  await client.connect()
  await client.query(sql)
  console.log('WAYYAK Phase 1 schema migrated successfully')
} finally {
  await client.end()
}
