import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function verify() {
  const result = await client.execute('SELECT code, description, accounts FROM accounts');
  console.log('Account codes with descriptions:');
  console.table(result.rows);
  console.log('Total rows:', result.rows.length);
}

verify();
