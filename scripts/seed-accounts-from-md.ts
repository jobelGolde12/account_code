import { createClient } from '@libsql/client';
import * as fs from 'fs';
import * as path from 'path';

const TursoUrl = process.env.TURSO_DATABASE_URL || 'libsql://accountcode-sirjobel.aws-ap-northeast-1.turso.io';
const TursoAuth = process.env.TURSO_AUTH_TOKEN;

if (!TursoUrl.startsWith('libsql://')) {
  console.log('Error: TURSO_DATABASE_URL must be set to a Turso libsql URL');
  console.log('Example: TURSO_DATABASE_URL=libsql://your-db.turso.io');
  process.exit(1);
}

const client = createClient({
  url: TursoUrl,
  authToken: TursoAuth,
});

const mdPath = path.join(process.cwd(), 'accounts.md');
const mdContent = fs.readFileSync(mdPath, 'utf-8');
const accountsData = JSON.parse(mdContent);

const accountCodesSheet = accountsData.sheets.find(
  (sheet: any) => sheet.type === 'account_codes'
);

if (!accountCodesSheet) {
  console.error('No account_codes sheet found in accounts.md');
  process.exit(1);
}

async function seed() {
  console.log('Seeding accounts table with account codes from accounts.md...');
  console.log(`Database URL: ${TursoUrl}`);
  
  const deleteResult = await client.execute('DELETE FROM accounts');
  console.log(`Deleted ${deleteResult.rowsAffected} rows from accounts table`);
  
  let imported = 0;
  const createdAt = new Date().toISOString();

  for (const account of accountCodesSheet.accounts) {
    try {
      await client.execute({
        sql: `INSERT INTO accounts (jev, barangay, date, check_rcd_no, payee, particulars, description, code, accounts, debit, credit, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          null,
          null,
          null,
          null,
          null,
          null,
          account.description || null,
          account.account_code || null,
          account.account_title || null,
          null,
          null,
          createdAt,
        ],
      });
      imported++;
    } catch (error) {
      console.error(`Error inserting account code ${account.account_code}:`, error);
    }
  }

  console.log(`\nSeeding complete!`);
  console.log(`Imported: ${imported} account codes`);
}

seed().catch(console.error);
