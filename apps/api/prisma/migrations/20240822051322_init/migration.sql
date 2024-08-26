-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "jobId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "data" JSONB,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenUsage" (
    "id" SERIAL NOT NULL,
    "endpoint" TEXT NOT NULL,
    "request_tokens" INTEGER NOT NULL,
    "response_tokens" INTEGER NOT NULL,
    "total_tokens" INTEGER NOT NULL,
    "request_content" TEXT NOT NULL,
    "response_content" TEXT NOT NULL,
    "options" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Job_jobId_key" ON "Job"("jobId");
