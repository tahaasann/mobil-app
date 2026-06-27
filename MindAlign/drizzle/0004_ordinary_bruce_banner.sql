CREATE TABLE `bookmarks` (
	`id` text PRIMARY KEY NOT NULL,
	`habit_id` text,
	`habit_title` text,
	`content` text NOT NULL,
	`barrier_label` text,
	`micro_task` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`habit_id` text,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
