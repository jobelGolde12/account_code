import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const accounts = sqliteTable('accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  jev: text('jev'),
  barangay: text('barangay'),
  date: text('date'),
  checkRcdNo: text('check_rcd_no'),
  payee: text('payee'),
  particulars: text('particulars'),
  description: text('description'),
  code: text('code'),
  accounts: text('accounts'),
  debit: text('debit'),
  credit: text('credit'),
  updatedAt: text('updated_at'),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  deletedAt: text('deleted_at'),
});

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  deletedAt: text('deleted_at'),
});

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
