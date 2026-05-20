import 'dotenv/config'
import { readdir, readFile } from 'node:fs/promises'
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

const migrationsDir = path.join(__dirname, '..', 'db', 'migrations')
const files = (await readdir(migrationsDir)).filter((file) => file.endsWith('.sql')).sort()
const client = new Client({ connectionString: databaseUrl })

try {
  await client.connect()
  for (const file of files) {
    const sql = await readFile(path.join(migrationsDir, file), 'utf8')
    await client.query(sql)
    console.log(`Applied ${file}`)
  }
  console.log('WAYYAK migrations completed successfully')
} finally {
  await client.end()
}
