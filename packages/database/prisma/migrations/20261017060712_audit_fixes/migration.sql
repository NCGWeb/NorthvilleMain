-- AlterTable
ALTER TABLE "BlogCategory" ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "heading" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Enquiry" ADD COLUMN     "emailStatus" TEXT NOT NULL DEFAULT 'sent';

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "height" INTEGER,
ADD COLUMN     "width" INTEGER;

-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "noindex" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "sessionVersion" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "LoginAttempt" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LoginAttempt_key_createdAt_idx" ON "LoginAttempt"("key", "createdAt");
