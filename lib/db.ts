import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '@/drizzle/schema';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://accountcode-sirjobel.aws-ap-northeast-1.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });

export { schema };
