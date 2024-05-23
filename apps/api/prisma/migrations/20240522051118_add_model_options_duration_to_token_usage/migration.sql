/*
  Warnings:

  - Added the required column `duration` to the `TokenUsage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `model` to the `TokenUsage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `options` to the `TokenUsage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TokenUsage" ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "model" TEXT NOT NULL,
ADD COLUMN     "options" TEXT NOT NULL;
