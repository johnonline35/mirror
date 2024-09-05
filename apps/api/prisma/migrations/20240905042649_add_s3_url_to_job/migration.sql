/*
  Warnings:

  - You are about to drop the column `data` on the `Job` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Job" DROP COLUMN "data",
ADD COLUMN     "s3Url" TEXT;
