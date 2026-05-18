import pg, { type QueryResultRow } from 'pg'

const { Pool } = pg

let pool: pg.Pool | undefined

export function getDbPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured')
  }

  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  })

  return pool
}

export const wayyakDb = {
  async query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]) {
    return getDbPool().query<T>(text, params)
  },
}
