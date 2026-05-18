# WAYYAK / وياك

Saudi space-sharing marketplace pilot for KSU University Incubation Centre.

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Static export for MagicAI preview server
- MagicAI internal Postgres for Phase 1

## Links

- Preview: https://demo.magicaiweb.com/websites/wayyak/
- GitHub: https://github.com/magicaiweb/magicai-wayyak

## Phase 1 Database

Migration:

```bash
DATABASE_URL='postgresql://...' npm run db:migrate
```

Seed KSU demo data:

```bash
DATABASE_URL='postgresql://...' npm run db:seed
```

Run both:

```bash
DATABASE_URL='postgresql://...' npm run db:phase1
```

## Deployment

```bash
npm run build
sftp -b /tmp/wayyak_sftp.batch -i ~/.ssh/webupload_websrv -o StrictHostKeyChecking=no webupload@192.168.1.210
```

Target path: `websites/wayyak/`
