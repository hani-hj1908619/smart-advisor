/*
  Warnings:

  - Added the required column `majorId` to the `Package` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Package_name_key` ON `Package`;

-- AlterTable
ALTER TABLE `Package` ADD COLUMN `majorId` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `Package_majorId_idx` ON `Package`(`majorId`);
