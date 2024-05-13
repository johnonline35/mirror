-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "jobId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "data" JSONB,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Job_jobId_key" ON "Job"("jobId");
