/*
  Warnings:

  - You are about to drop the column `language` on the `Leaderboard` table. All the data in the column will be lost.
  - You are about to drop the column `rank` on the `Leaderboard` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `Language` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[best_submission_id]` on the table `Leaderboard` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[challenge_id,user_id]` on the table `Leaderboard` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `Challenge` table without a default value. This is not possible if the table is not empty.
  - Made the column `point` on table `Challenge` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `best_submission_id` to the `Leaderboard` table without a default value. This is not possible if the table is not empty.
  - Made the column `score` on table `Testcase` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "TestcaseResultStatus" AS ENUM ('AC', 'WA', 'CE', 'RE', 'TLE', 'MLE', 'IE', 'SKIPPED');

-- CreateEnum
CREATE TYPE "SubmissionKind" AS ENUM ('CODE', 'ZIP');

-- CreateEnum
CREATE TYPE "TestcaseVisibility" AS ENUM ('PUBLIC', 'HIDDEN', 'SYSTEM');

-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "point" SET NOT NULL;

-- AlterTable
ALTER TABLE "Language" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "runtime" VARCHAR(50);

-- AlterTable
ALTER TABLE "Leaderboard" DROP COLUMN "language",
DROP COLUMN "rank",
ADD COLUMN     "best_submission_id" TEXT NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "submitted_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "error_message" TEXT,
ADD COLUMN     "file_path" TEXT,
ADD COLUMN     "finished_at" TIMESTAMP(3),
ADD COLUMN     "kind" "SubmissionKind" NOT NULL DEFAULT 'CODE',
ADD COLUMN     "memory_kb" INTEGER,
ADD COLUMN     "runtime_ms" INTEGER,
ADD COLUMN     "started_at" TIMESTAMP(3),
ALTER COLUMN "code" DROP NOT NULL,
ALTER COLUMN "score" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Testcase" ADD COLUMN     "expected_json" JSONB,
ADD COLUMN     "input_json" JSONB,
ADD COLUMN     "name" VARCHAR(255),
ADD COLUMN     "order_index" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "visibility" "TestcaseVisibility" NOT NULL DEFAULT 'HIDDEN',
ALTER COLUMN "score" SET NOT NULL,
ALTER COLUMN "score" SET DEFAULT 1,
ALTER COLUMN "expected_output_path" DROP NOT NULL,
ALTER COLUMN "input_path" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ChallengeConfig" (
    "id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,
    "submission_kind" "SubmissionKind" DEFAULT 'CODE',
    "required_port" INTEGER DEFAULT 3000,
    "health_path" VARCHAR(255) DEFAULT '/health',
    "start_command" VARCHAR(255) DEFAULT 'npm start',
    "allow_network" BOOLEAN NOT NULL DEFAULT false,
    "allow_file_write" BOOLEAN NOT NULL DEFAULT false,
    "max_project_size_mb" INTEGER DEFAULT 5,
    "max_output_kb" INTEGER DEFAULT 256,
    "allowed_dependencies" JSONB,
    "api_contract" JSONB,
    "security_policy" JSONB,
    "database_mode" VARCHAR(50),

    CONSTRAINT "ChallengeConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestcaseStep" (
    "id" TEXT NOT NULL,
    "testcase_id" TEXT NOT NULL,
    "name" VARCHAR(255),
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "method" VARCHAR(10) NOT NULL,
    "path" VARCHAR(500) NOT NULL,
    "headers_json" JSONB,
    "body_json" JSONB,
    "expected_status" INTEGER NOT NULL,
    "expected_json" JSONB,
    "expected_headers_json" JSONB,
    "assert_json" JSONB,
    "save_variables" JSONB,

    CONSTRAINT "TestcaseStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionTestcaseResult" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "testcase_id" TEXT NOT NULL,
    "status" "TestcaseResultStatus" NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "max_score" INTEGER NOT NULL DEFAULT 0,
    "runtime_ms" INTEGER,
    "memory_kb" INTEGER,
    "message" TEXT,
    "stdout" TEXT,
    "stderr" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmissionTestcaseResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeConfig_challenge_id_key" ON "ChallengeConfig"("challenge_id");

-- CreateIndex
CREATE INDEX "TestcaseStep_testcase_id_idx" ON "TestcaseStep"("testcase_id");

-- CreateIndex
CREATE INDEX "TestcaseStep_testcase_id_order_index_idx" ON "TestcaseStep"("testcase_id", "order_index");

-- CreateIndex
CREATE INDEX "SubmissionTestcaseResult_submission_id_idx" ON "SubmissionTestcaseResult"("submission_id");

-- CreateIndex
CREATE INDEX "SubmissionTestcaseResult_testcase_id_idx" ON "SubmissionTestcaseResult"("testcase_id");

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionTestcaseResult_submission_id_testcase_id_key" ON "SubmissionTestcaseResult"("submission_id", "testcase_id");

-- CreateIndex
CREATE INDEX "Challenge_type_idx" ON "Challenge"("type");

-- CreateIndex
CREATE INDEX "Challenge_difficulty_idx" ON "Challenge"("difficulty");

-- CreateIndex
CREATE INDEX "Challenge_created_at_idx" ON "Challenge"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "Language_code_key" ON "Language"("code");

-- CreateIndex
CREATE INDEX "Language_code_idx" ON "Language"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Leaderboard_best_submission_id_key" ON "Leaderboard"("best_submission_id");

-- CreateIndex
CREATE INDEX "Leaderboard_challenge_id_score_idx" ON "Leaderboard"("challenge_id", "score");

-- CreateIndex
CREATE INDEX "Leaderboard_user_id_idx" ON "Leaderboard"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Leaderboard_challenge_id_user_id_key" ON "Leaderboard"("challenge_id", "user_id");

-- CreateIndex
CREATE INDEX "Submission_language_id_idx" ON "Submission"("language_id");

-- CreateIndex
CREATE INDEX "Testcase_challenge_id_idx" ON "Testcase"("challenge_id");

-- CreateIndex
CREATE INDEX "Testcase_challenge_id_visibility_idx" ON "Testcase"("challenge_id", "visibility");

-- CreateIndex
CREATE INDEX "Testcase_challenge_id_order_index_idx" ON "Testcase"("challenge_id", "order_index");

-- AddForeignKey
ALTER TABLE "ChallengeConfig" ADD CONSTRAINT "ChallengeConfig_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestcaseStep" ADD CONSTRAINT "TestcaseStep_testcase_id_fkey" FOREIGN KEY ("testcase_id") REFERENCES "Testcase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionTestcaseResult" ADD CONSTRAINT "SubmissionTestcaseResult_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionTestcaseResult" ADD CONSTRAINT "SubmissionTestcaseResult_testcase_id_fkey" FOREIGN KEY ("testcase_id") REFERENCES "Testcase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leaderboard" ADD CONSTRAINT "Leaderboard_best_submission_id_fkey" FOREIGN KEY ("best_submission_id") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
