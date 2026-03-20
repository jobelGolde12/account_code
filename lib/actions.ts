'use server';

import { db, schema } from './db';
import { eq, like, or, isNull } from 'drizzle-orm';
import { validateCodeSchema, cleanText } from './validation';
import { Account } from '@/drizzle/schema';

export async function getAccounts(search?: string): Promise<Account[]> {
  if (search) {
    const searchTerm = `%${search}%`;
    return db.select().from(schema.accounts)
      .where(
        or(
          like(schema.accounts.jev, searchTerm),
          like(schema.accounts.payee, searchTerm),
          like(schema.accounts.code, searchTerm),
          like(schema.accounts.accounts, searchTerm)
        )
      );
  }
  return db.select().from(schema.accounts).where(isNull(schema.accounts.deletedAt));
}

export async function getAccountStats() {
  const accounts = await db.select().from(schema.accounts).where(isNull(schema.accounts.deletedAt));
  return {
    total: accounts.length,
  };
}

export async function validateCode(code: string) {
  const result = validateCodeSchema.safeParse({ code });
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const cleanCode = cleanText(code);
  const account = await db.select().from(schema.accounts)
    .where(eq(schema.accounts.code, cleanCode))
    .limit(1);

  if (account.length === 0) {
    return { success: false, error: 'Code not found', code: cleanCode };
  }

  return { success: true, account: account[0] };
}

export async function addAccount(data: { 
  jev?: string; 
  barangay?: string; 
  date?: string; 
  checkRcdNo?: string; 
  payee?: string; 
  particulars?: string; 
  code?: string; 
  accounts?: string; 
  debit?: string; 
  credit?: string; 
}) {
  await db.insert(schema.accounts).values({
    jev: data.jev || null,
    barangay: data.barangay || null,
    date: data.date || null,
    checkRcdNo: data.checkRcdNo || null,
    payee: data.payee || null,
    particulars: data.particulars || null,
    code: data.code || null,
    accounts: data.accounts || null,
    debit: data.debit || null,
    credit: data.credit || null,
    createdAt: new Date().toISOString(),
  });

  return { success: true };
}

export async function updateAccount(id: number, data: { 
  jev?: string; 
  barangay?: string; 
  date?: string; 
  checkRcdNo?: string; 
  payee?: string; 
  particulars?: string; 
  code?: string; 
  accounts?: string; 
  debit?: string; 
  credit?: string; 
}) {
  await db.update(schema.accounts)
    .set({ 
      ...data,
      updatedAt: new Date().toISOString() 
    })
    .where(eq(schema.accounts.id, id));

  return { success: true };
}

export async function deleteAccount(id: number) {
  await db.update(schema.accounts)
    .set({ deletedAt: new Date().toISOString() })
    .where(eq(schema.accounts.id, id));
  return { success: true };
}

export async function importAccounts(accounts: { 
  jev?: string;
  barangay?: string;
  date?: string;
  check_rcd_no?: string;
  payee?: string;
  particulars?: string;
  code?: string;
  account?: string;
  debit?: number;
  credit?: number;
}[]) {
  let imported = 0;
  let skipped = 0;

  for (const account of accounts) {
    try {
      await db.insert(schema.accounts).values({
        jev: account.jev || null,
        barangay: account.barangay || null,
        date: account.date || null,
        checkRcdNo: account.check_rcd_no || null,
        payee: account.payee || null,
        particulars: account.particulars || null,
        code: account.code || null,
        accounts: account.account || null,
        debit: account.debit?.toString() || null,
        credit: account.credit?.toString() || null,
        createdAt: new Date().toISOString(),
      });
      imported++;
    } catch {
      skipped++;
    }
  }

  return { success: true, imported, skipped };
}
