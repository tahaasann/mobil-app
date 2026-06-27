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
  bonusCount: integer('bonus_count').notNull().default(0),
  updatedAt: text('updated_at').notNull(),
});

export const appSettings = sqliteTable('app_settings', {
  id: text('id').primaryKey().notNull(),
  selectedApproach: text('selected_approach').notNull().default('universal'),
  language: text('language').notNull().default('en'),
  theme: text('theme').notNull().default('auto'),
  onboardingCompleted: integer('onboarding_completed', { mode: 'boolean' })
    .notNull()
    .default(false),
  createdAt: text('created_at').notNull(),
});

export const userProfile = sqliteTable('user_profile', {
  id: text('id').primaryKey().notNull(),
  identityGoal: text('identity_goal'),
  defaultTone: text('default_tone').notNull().default('gentle'),
  commonBarrier: text('common_barrier'),
  notifWindow: text('notif_window'),
  notifFrequency: integer('notif_frequency'),
  updatedAt: text('updated_at').notNull(),
});

export const bookmarks = sqliteTable('bookmarks', {
  id: text('id').primaryKey().notNull(),
  habitId: text('habit_id'),
  habitTitle: text('habit_title'),
  content: text('content').notNull(),
  barrierLabel: text('barrier_label'),
  microTask: text('micro_task'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const chatMessages = sqliteTable('chat_messages', {
  id: text('id').primaryKey().notNull(),
  habitId: text('habit_id'),
  role: text('role').notNull(),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
