-- AlterTable
ALTER TABLE "Leaderboard" ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'Not found',
ADD COLUMN     "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
