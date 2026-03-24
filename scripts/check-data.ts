import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function check() {
  const result = await client.execute('SELECT id, code, description, accounts FROM accounts LIMIT 5');
  console.log('Sample data:');
  console.table(result.rows);
}

check();
