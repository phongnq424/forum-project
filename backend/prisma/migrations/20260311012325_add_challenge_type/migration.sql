-- CreateEnum
CREATE TYPE "ChallengeType" AS ENUM ('DSA', 'SQL', 'BACKEND', 'CONTEST');

-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "type" "ChallengeType" NOT NULL DEFAULT 'DSA';
