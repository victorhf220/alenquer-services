CREATE TABLE `neighborhoods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `neighborhoods_id` PRIMARY KEY(`id`),
	CONSTRAINT `neighborhoods_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `service_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`icon` varchar(50),
	`synonyms` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `service_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `service_categories_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `service_providers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(150) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`categoryId` int NOT NULL,
	`neighborhoodId` int NOT NULL,
	`description` text,
	`isActive` int NOT NULL DEFAULT 1,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`isFeatured` int NOT NULL DEFAULT 0,
	`approvedAt` timestamp,
	`rejectionReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `service_providers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`userType` enum('customer','provider','admin') NOT NULL DEFAULT 'customer',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_profiles_userId_unique` UNIQUE(`userId`)
);
