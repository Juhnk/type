/*
  Warnings:

  - Added the required column `updatedAt` to the `UserSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TestResults" ALTER COLUMN "timestamp" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "UserSettings" ADD COLUMN     "animations" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "autoSave" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "blindMode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "caretColor" TEXT NOT NULL DEFAULT '#3b82f6',
ADD COLUMN     "colorScheme" TEXT NOT NULL DEFAULT 'auto',
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "defaultDifficulty" TEXT NOT NULL DEFAULT 'Normal',
ADD COLUMN     "defaultDuration" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "defaultMode" TEXT NOT NULL DEFAULT 'time',
ADD COLUMN     "defaultWordCount" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "focusMode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "font" TEXT NOT NULL DEFAULT 'Roboto Mono',
ADD COLUMN     "fontSize" INTEGER NOT NULL DEFAULT 18,
ADD COLUMN     "keyFeedback" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paceCaretEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "quickRestart" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showAccuracyCounter" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showWpmCounter" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "smoothCaret" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "soundEffects" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);
