import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const accounts = sqliteTable('accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  jev: text('jev'),
  barangay: text('barangay'),
  date: text('date'),
  checkRcdNo: text('check_rcd_no'),
  payee: text('payee'),
  particulars: text('particulars'),
  code: text('code'),
  accounts: text('accounts'),
  debit: text('debit'),
  credit: text('credit'),
  updatedAt: text('updated_at'),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  deletedAt: text('deleted_at'),
});

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
