-- CreateTable
CREATE TABLE "ChatAnswer" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "keywords" TEXT NOT NULL DEFAULT '',
    "answer" TEXT NOT NULL,
    "linkLabel" TEXT NOT NULL DEFAULT '',
    "linkHref" TEXT NOT NULL DEFAULT '',
    "showAsPill" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ChatAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatQuestion" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "answered" BOOLEAN NOT NULL,
    "answerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatQuestion_answered_createdAt_idx" ON "ChatQuestion"("answered", "createdAt");
