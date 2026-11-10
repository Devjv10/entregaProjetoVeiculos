CREATE TABLE `User` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('ADMIN', 'CLIENTE') NOT NULL DEFAULT 'CLIENTE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Vehicle` (
    `id` CHAR(36) NOT NULL,
    `brand` VARCHAR(60) NOT NULL,
    `model` VARCHAR(80) NOT NULL,
    `year` INTEGER NOT NULL,
    `plate` VARCHAR(7) NOT NULL,
    `color` VARCHAR(40) NOT NULL,
    `category` ENUM('ECONOMY', 'SEDAN', 'SUV', 'HATCH', 'PICKUP', 'LUXURY') NOT NULL,
    `dailyRate` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('AVAILABLE', 'RENTED', 'MAINTENANCE') NOT NULL DEFAULT 'AVAILABLE',
    `imageUrl` VARCHAR(2048) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Vehicle_plate_key`(`plate`),
    INDEX `Vehicle_status_category_idx`(`status`, `category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Rental` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `vehicleId` CHAR(36) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `expectedReturnDate` DATETIME(3) NOT NULL,
    `actualReturnDate` DATETIME(3) NULL,
    `contractedDailyRate` DECIMAL(10, 2) NOT NULL,
    `estimatedTotal` DECIMAL(12, 2) NOT NULL,
    `finalTotal` DECIMAL(12, 2) NULL,
    `status` ENUM('ACTIVE', 'COMPLETED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Rental_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `Rental_vehicleId_status_idx`(`vehicleId`, `status`),
    INDEX `Rental_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Rental` ADD CONSTRAINT `Rental_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Rental` ADD CONSTRAINT `Rental_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `Vehicle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
