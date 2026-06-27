import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const appMeta = sqliteTable('app_meta', {
  key: text('key').primaryKey().notNull(),
  value: text('value').notNull(),
});

export const habits = sqliteTable('habits', {
  id: text('id').primaryKey().notNull(),
  title: text('title').notNull(),
  description: text('description'),
  schedule: text('schedule').notNull().default('daily'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
});

export const habitLogs = sqliteTable(
  'habit_logs',
  {
    id: text('id').primaryKey().notNull(),
    habitId: text('habit_id')
      .notNull()
      .references(() => habits.id),
    date: text('date').notNull(),
    status: text('status').notNull(),
    excuseText: text('excuse_text'),
    barrierLabel: text('barrier_label'),
    rescueTaskText: text('rescue_task_text'),
    createdAt: text('created_at').notNull(),
  },
  (table) => ({
    habitDateUnique: uniqueIndex('habit_logs_habit_id_date_unique').on(table.habitId, table.date),
  }),
);

export const aiUsage = sqliteTable('ai_usage', {
  weekStart: text('week_start').primaryKey().notNull(),
  count: integer('count').notNull().default(0),
  updatedAt: text('updated_at').notNull(),
});
