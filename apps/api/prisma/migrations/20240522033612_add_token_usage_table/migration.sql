-- CreateTable
CREATE TABLE "TokenUsage" (
    "id" SERIAL NOT NULL,
    "endpoint" TEXT NOT NULL,
    "request_tokens" INTEGER NOT NULL,
    "response_tokens" INTEGER NOT NULL,
    "total_tokens" INTEGER NOT NULL,
    "request_content" TEXT NOT NULL,
    "response_content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenUsage_pkey" PRIMARY KEY ("id")
);
