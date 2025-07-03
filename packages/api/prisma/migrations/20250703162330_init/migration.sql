-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "userId" TEXT NOT NULL,
    "theme" VARCHAR(50) NOT NULL DEFAULT 'slate',
    "caretStyle" VARCHAR(20) NOT NULL DEFAULT 'line',
    "paceCaretWpm" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "TestResults" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wpm" INTEGER NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "rawWpm" INTEGER NOT NULL,
    "consistency" DOUBLE PRECISION,
    "config" JSONB NOT NULL,
    "tags" TEXT[],
    "timestamp" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestResults_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestResults" ADD CONSTRAINT "TestResults_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
