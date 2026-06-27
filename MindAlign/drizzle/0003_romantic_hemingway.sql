CREATE TABLE `app_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`selected_approach` text DEFAULT 'universal' NOT NULL,
	`language` text DEFAULT 'en' NOT NULL,
	`theme` text DEFAULT 'auto' NOT NULL,
	`onboarding_completed` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_profile` (
	`id` text PRIMARY KEY NOT NULL,
	`identity_goal` text,
	`default_tone` text DEFAULT 'gentle' NOT NULL,
	`common_barrier` text,
	`notif_window` text,
	`notif_frequency` integer,
	`updated_at` text NOT NULL
);
