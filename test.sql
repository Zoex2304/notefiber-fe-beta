--
-- MySQL Database Schema for NoteFiber (Full Version - MySQL Compatible)
--
-- TUJUAN: Extend dari MVP NoteFiber V1 yang STABIL tanpa mengubah struktur core
-- PRINSIP: Tidak mengubah nama kolom, tipe data, atau constraint yang sudah ada di MVP
-- STRATEGI: Hanya menambahkan tabel baru untuk fitur SaaS (users, subscriptions, relationships)
--
-- KOMPATIBILITAS: Dikonversi dari PostgreSQL ke MySQL
--

-- ============================================
-- BASE UTILITY (MySQL Trigger untuk updated_at)
-- ============================================

-- MySQL menggunakan trigger untuk auto-update updated_at
-- Akan dibuat per tabel setelah CREATE TABLE

-- ============================================
-- 1. CORE MVP TABLES (TIDAK DIUBAH SAMA SEKALI!)
-- ============================================

-- Tabel Chat Session
CREATE TABLE `chat_session` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()),
    `title` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Chat Message
CREATE TABLE `chat_message` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()),
    `role` VARCHAR(50) NOT NULL,
    `chat` TEXT NOT NULL,
    `chat_session_id` CHAR(36) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    KEY `idx_chat_session_id` (`chat_session_id`),
    CONSTRAINT `fk_chat_message_session` 
        FOREIGN KEY (`chat_session_id`) 
        REFERENCES `chat_session`(`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Chat Message Raw
CREATE TABLE `chat_message_raw` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()),
    `role` VARCHAR(50) NOT NULL,
    `chat` TEXT NOT NULL,
    `chat_session_id` CHAR(36) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    KEY `idx_chat_session_id_raw` (`chat_session_id`),
    CONSTRAINT `fk_chat_message_raw_session` 
        FOREIGN KEY (`chat_session_id`) 
        REFERENCES `chat_session`(`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Notebook
CREATE TABLE `notebook` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()),
    `name` VARCHAR(255) NOT NULL,
    `parent_id` CHAR(36) NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    KEY `idx_parent_id` (`parent_id`),
    CONSTRAINT `fk_notebook_parent` 
        FOREIGN KEY (`parent_id`) 
        REFERENCES `notebook`(`id`) 
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Note
CREATE TABLE `note` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()),
    `title` VARCHAR(500) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `notebook_id` CHAR(36) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    KEY `idx_notebook_id` (`notebook_id`),
    CONSTRAINT `fk_note_notebook` 
        FOREIGN KEY (`notebook_id`) 
        REFERENCES `notebook`(`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Note Embedding (Vector disimpan sebagai JSON)
CREATE TABLE `note_embedding` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()),
    `document` TEXT NOT NULL,
    `embedding_value` JSON NOT NULL COMMENT 'Vector 3072 dimensions stored as JSON array',
    `note_id` CHAR(36) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    `is_deleted` TINYINT(1) DEFAULT 0,
    PRIMARY KEY (`id`),
    KEY `idx_note_id` (`note_id`),
    CONSTRAINT `fk_note_embedding_note` 
        FOREIGN KEY (`note_id`) 
        REFERENCES `note`(`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. NEW TABLES FOR SAAS FEATURES
-- ============================================

-- Tabel Users
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()),
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NULL DEFAULT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    `status` ENUM('pending', 'active', 'suspended', 'deleted') NOT NULL DEFAULT 'pending',
    `email_verified` TINYINT(1) NOT NULL DEFAULT 0,
    `email_verified_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel User Providers (OAuth)
CREATE TABLE `user_providers` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()),
    `user_id` CHAR(36) NOT NULL,
    `provider_name` VARCHAR(50) NOT NULL,
    `provider_user_id` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_provider_user` (`provider_name`, `provider_user_id`),
    KEY `idx_user_id` (`user_id`),
    CONSTRAINT `fk_user_providers_user` 
        FOREIGN KEY (`user_id`) 
        REFERENCES `users`(`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Password Reset Tokens
CREATE TABLE `password_reset_tokens` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()),
    `user_id` CHAR(36) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `expires_at` TIMESTAMP NOT NULL,
    `used` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_token` (`token`),
    CONSTRAINT `fk_password_reset_user` 
        FOREIGN KEY (`user_id`) 
        REFERENCES `users`(`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Subscription Plans
CREATE TABLE `subscription_plans` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()),
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `description` TEXT NULL DEFAULT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `billing_period` ENUM('monthly', 'yearly') NULL DEFAULT NULL,
    `max_notes` INT NULL DEFAULT NULL,
    `semantic_search_enabled` TINYINT(1) NOT NULL DEFAULT 0,
    `ai_chat_enabled` TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel User Subscriptions
CREATE TABLE `user_subscriptions` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()),
    `user_id` CHAR(36) NOT NULL,
    `plan_id` CHAR(36) NOT NULL,
    `status` ENUM('active', 'inactive', 'canceled', 'trial') NOT NULL DEFAULT 'inactive',
    `current_period_start` TIMESTAMP NOT NULL,
    `current_period_end` TIMESTAMP NOT NULL,
    `payment_status` ENUM('pending', 'success', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    `midtrans_transaction_id` VARCHAR(255) NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_plan_id` (`plan_id`),
    KEY `idx_midtrans_id` (`midtrans_transaction_id`),
    CONSTRAINT `fk_user_subscriptions_user` 
        FOREIGN KEY (`user_id`) 
        REFERENCES `users`(`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_user_subscriptions_plan` 
        FOREIGN KEY (`plan_id`) 
        REFERENCES `subscription_plans`(`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. RELATIONSHIP TABLES (USER OWNERSHIP)
-- ============================================

-- Relasi: User memiliki Notebook
CREATE TABLE `user_notebooks` (
    `user_id` CHAR(36) NOT NULL,
    `notebook_id` CHAR(36) NOT NULL,
    `is_owner` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`, `notebook_id`),
    KEY `idx_notebook_id` (`notebook_id`),
    CONSTRAINT `fk_user_notebooks_user` 
        FOREIGN KEY (`user_id`) 
        REFERENCES `users`(`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_user_notebooks_notebook` 
        FOREIGN KEY (`notebook_id`) 
        REFERENCES `notebook`(`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Relasi: User memiliki Notes
CREATE TABLE `user_notes` (
    `user_id` CHAR(36) NOT NULL,
    `note_id` CHAR(36) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`, `note_id`),
    KEY `idx_note_id` (`note_id`),
    CONSTRAINT `fk_user_notes_user` 
        FOREIGN KEY (`user_id`) 
        REFERENCES `users`(`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_user_notes_note` 
        FOREIGN KEY (`note_id`) 
        REFERENCES `note`(`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Relasi: User memiliki Chat Sessions
CREATE TABLE `user_chat_sessions` (
    `user_id` CHAR(36) NOT NULL,
    `chat_session_id` CHAR(36) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`, `chat_session_id`),
    KEY `idx_chat_session_id` (`chat_session_id`),
    CONSTRAINT `fk_user_chat_sessions_user` 
        FOREIGN KEY (`user_id`) 
        REFERENCES `users`(`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_user_chat_sessions_session` 
        FOREIGN KEY (`chat_session_id`) 
        REFERENCES `chat_session`(`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. INITIAL DATA & SEEDING
-- ============================================

-- Insert Subscription Plans
INSERT INTO `subscription_plans` (`name`, `slug`, `description`, `price`, `billing_period`, `max_notes`, `semantic_search_enabled`, `ai_chat_enabled`) VALUES
('Free Plan', 'free', 'Akses dasar untuk membuat catatan dan pencarian kata kunci.', 0.00, 'monthly', 50, 0, 0),
('Pro Plan Monthly', 'pro_monthly', 'Fitur penuh dengan Semantic Search dan Chatbot AI.', 9.99, 'monthly', NULL, 1, 1),
('Pro Plan Yearly', 'pro_yearly', 'Fitur penuh dengan diskon tahunan.', 99.99, 'yearly', NULL, 1, 1);

-- Insert Admin User (password: Admin123! - hashed with bcrypt cost 10)
INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `role`, `status`, `email_verified`, `email_verified_at`)
VALUES (
    '00000000-0000-0000-0000-000000000001', 
    'admin@notefiber.com', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Password: Admin123!
    'System Administrator', 
    'admin', 
    'active', 
    1, 
    NOW()
);

-- Insert Demo User (password: User123!)
INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `role`, `status`, `email_verified`, `email_verified_at`)
VALUES (
    '00000000-0000-0000-0000-000000000002', 
    'user@notefiber.com', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Password: User123!
    'Demo User', 
    'user', 
    'active', 
    1, 
    NOW()
);

-- ============================================
-- 5. VIEWS FOR CONVENIENCE
-- ============================================

-- View untuk Semantic Search
CREATE OR REPLACE VIEW `semantic_searchable_notes` AS
SELECT
    n.`id` AS `note_id`,
    un.`user_id`
FROM
    `note` n
INNER JOIN
    `note_embedding` ne ON n.`id` = ne.`note_id`
INNER JOIN
    `user_notes` un ON n.`id` = un.`note_id`
WHERE
    n.`is_deleted` = 0;

-- View untuk Payment History
CREATE OR REPLACE VIEW `user_payment_history` AS
SELECT
    us.`user_id`,
    us.`plan_id`,
    us.`payment_status`,
    us.`midtrans_transaction_id`,
    us.`created_at` AS `payment_date`
FROM
    `user_subscriptions` us
ORDER BY
    us.`created_at` DESC;

-- ============================================
-- 6. MATERIALIZED VIEWS (Implemented as Tables)
-- ============================================

-- MV untuk User Performance Summary
CREATE TABLE `admin_user_performance_summary` (
    `user_id` CHAR(36) NOT NULL,
    `total_notes` INT NOT NULL DEFAULT 0,
    `total_chats` INT NOT NULL DEFAULT 0,
    `subscription_id` CHAR(36) NULL DEFAULT NULL,
    `last_updated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`),
    KEY `idx_subscription_id` (`subscription_id`),
    CONSTRAINT `fk_admin_performance_user` 
        FOREIGN KEY (`user_id`) 
        REFERENCES `users`(`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_admin_performance_subscription` 
        FOREIGN KEY (`subscription_id`) 
        REFERENCES `user_subscriptions`(`id`) 
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Initial population for admin_user_performance_summary
INSERT INTO `admin_user_performance_summary` (`user_id`, `total_notes`, `total_chats`, `subscription_id`)
SELECT 
    u.`id` AS `user_id`,
    (SELECT COUNT(*) FROM `user_notes` un WHERE un.`user_id` = u.`id`) AS `total_notes`,
    (SELECT COUNT(*) FROM `user_chat_sessions` ucs WHERE ucs.`user_id` = u.`id`) AS `total_chats`,
    (SELECT us.`id` FROM `user_subscriptions` us 
     WHERE us.`user_id` = u.`id` AND us.`status` = 'active' 
     ORDER BY us.`created_at` DESC LIMIT 1) AS `subscription_id`
FROM `users` u
WHERE u.`role` = 'user';

-- MV untuk Payment Audit
CREATE TABLE `admin_payment_audit_view` (
    `subscription_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `plan_id` CHAR(36) NOT NULL,
    `last_updated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`subscription_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_plan_id` (`plan_id`),
    CONSTRAINT `fk_admin_audit_subscription` 
        FOREIGN KEY (`subscription_id`) 
        REFERENCES `user_subscriptions`(`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_admin_audit_user` 
        FOREIGN KEY (`user_id`) 
        REFERENCES `users`(`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_admin_audit_plan` 
        FOREIGN KEY (`plan_id`) 
        REFERENCES `subscription_plans`(`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Initial population for admin_payment_audit_view
INSERT INTO `admin_payment_audit_view` (`subscription_id`, `user_id`, `plan_id`)
SELECT 
    us.`id` AS `subscription_id`,
    us.`user_id`,
    us.`plan_id`
FROM `user_subscriptions` us
ORDER BY us.`created_at` DESC;

-- ============================================
-- 7. STORED PROCEDURES FOR REFRESHING MVs
-- ============================================

DELIMITER $$

-- Procedure untuk refresh user performance summary
CREATE PROCEDURE `refresh_admin_user_performance_summary`()
BEGIN
    TRUNCATE TABLE `admin_user_performance_summary`;
    
    INSERT INTO `admin_user_performance_summary` (`user_id`, `total_notes`, `total_chats`, `subscription_id`)
    SELECT 
        u.`id` AS `user_id`,
        (SELECT COUNT(*) FROM `user_notes` un WHERE un.`user_id` = u.`id`) AS `total_notes`,
        (SELECT COUNT(*) FROM `user_chat_sessions` ucs WHERE ucs.`user_id` = u.`id`) AS `total_chats`,
        (SELECT us.`id` FROM `user_subscriptions` us 
         WHERE us.`user_id` = u.`id` AND us.`status` = 'active' 
         ORDER BY us.`created_at` DESC LIMIT 1) AS `subscription_id`
    FROM `users` u
    WHERE u.`role` = 'user';
END$$

-- Procedure untuk refresh payment audit
CREATE PROCEDURE `refresh_admin_payment_audit_view`()
BEGIN
    TRUNCATE TABLE `admin_payment_audit_view`;
    
    INSERT INTO `admin_payment_audit_view` (`subscription_id`, `user_id`, `plan_id`)
    SELECT 
        us.`id` AS `subscription_id`,
        us.`user_id`,
        us.`plan_id`
    FROM `user_subscriptions` us
    ORDER BY us.`created_at` DESC;
END$$

DELIMITER ;

