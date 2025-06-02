CREATE TABLE `ais` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`title` text NOT NULL,
	`version` text NOT NULL,
	`author` text,
	`avatar` text,
	`description` text,
	`type` text NOT NULL,
	`models` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`is_active` integer DEFAULT 1 NOT NULL,
	`last_used_at` text,
	`version_history` text,
	`tags` text
);
--> statement-breakpoint
CREATE TABLE `chat_participants` (
	`ai_id` integer,
	`room_id` integer,
	PRIMARY KEY(`ai_id`, `room_id`)
);
--> statement-breakpoint
CREATE TABLE `envs` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE TABLE `kv` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`message_type` text DEFAULT 'text' NOT NULL,
	`sort_by` integer NOT NULL,
	`chat_id` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`reference` text,
	`sender_type` text NOT NULL,
	`sender_id` integer,
	`parent_id` text,
	`status` text,
	`meta` text,
	`is_streaming` integer DEFAULT 0 NOT NULL,
	`stream_group_id` text,
	`stream_index` integer,
	`function_call` text,
	`function_response` text,
	`is_in_context` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`chat_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`avatar` text,
	`description` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`is_public` integer NOT NULL,
	`is_favorite` integer NOT NULL,
	`is_locked` integer NOT NULL,
	`is_pinned` integer NOT NULL,
	`is_archived` integer NOT NULL,
	`last_message_at` integer DEFAULT 0,
	`max_context_messages` integer DEFAULT 3 NOT NULL,
	`memory_interval` integer DEFAULT 15 NOT NULL,
	`prompt` text,
	`memory_interval_initial_value` integer DEFAULT 15 NOT NULL
);
