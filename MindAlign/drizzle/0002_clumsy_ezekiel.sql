CREATE TABLE `ai_usage` (
	`week_start` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `habit_logs` ADD `excuse_text` text;--> statement-breakpoint
ALTER TABLE `habit_logs` ADD `barrier_label` text;--> statement-breakpoint
ALTER TABLE `habit_logs` ADD `rescue_task_text` text;