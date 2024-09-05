-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_clientId_fkey";

-- AlterTable
ALTER TABLE "Job" ALTER COLUMN "clientId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("clientId") ON DELETE SET NULL ON UPDATE CASCADE;
