CREATE TABLE `habit_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`habit_id` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`habit_id`) REFERENCES `habits`(`id`) ON UPDATE no action ON DELETE no action
);
