/*
  Warnings:

  - You are about to drop the column `severity` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Report` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[case_id,reporter_id]` on the table `Report` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `case_id` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ReportTargetType" AS ENUM ('USER', 'POST', 'COMMENT', 'MESSAGE');

-- CreateEnum
CREATE TYPE "ReportCategory" AS ENUM ('SPAM', 'HARASSMENT', 'HATE_SPEECH', 'SEXUAL_CONTENT', 'VIOLENCE', 'SELF_HARM', 'SCAM', 'IMPERSONATION', 'PRIVACY_VIOLATION', 'MISINFORMATION', 'COPYRIGHT', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportResolution" AS ENUM ('VALID', 'INVALID', 'DUPLICATE', 'NOT_ENOUGH_EVIDENCE', 'AUTO_RESOLVED');

-- CreateEnum
CREATE TYPE "ModerationActionType" AS ENUM ('NONE', 'HIDE_CONTENT', 'RESTORE_CONTENT', 'DELETE_CONTENT', 'LOCK_CONTENT', 'WARN_USER', 'TEMP_BAN_USER', 'PERMANENT_BAN_USER', 'LIMIT_USER', 'DISMISS_REPORT');

-- CreateEnum
CREATE TYPE "ModerationSignalType" AS ENUM ('USER_REPORT', 'REPORT_COUNT', 'REPORTER_TRUST', 'AI_TEXT_SCORE', 'AI_IMAGE_SCORE', 'TARGET_AUTHOR_HISTORY', 'TARGET_VELOCITY', 'DUPLICATE_REPORT', 'RATE_LIMIT_TRIGGER');

-- AlterEnum
ALTER TYPE "ReportStatus" ADD VALUE 'TRIAGED';

-- DropIndex
DROP INDEX "public"."Report_severity_idx";

-- DropIndex
DROP INDEX "public"."Report_status_idx";

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "severity",
DROP COLUMN "status",
DROP COLUMN "title",
ADD COLUMN     "case_id" TEXT NOT NULL,
ADD COLUMN     "category" "ReportCategory" NOT NULL,
ADD COLUMN     "evidence" TEXT,
ADD COLUMN     "reporter_ip" TEXT,
ADD COLUMN     "user_agent" TEXT;

-- CreateTable
CREATE TABLE "ReportCase" (
    "id" TEXT NOT NULL,
    "active_key" TEXT,
    "target_type" "ReportTargetType" NOT NULL,
    "target_id" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "severity" "ReportSeverity" NOT NULL DEFAULT 'MEDIUM',
    "priority_score" INTEGER NOT NULL DEFAULT 0,
    "report_count" INTEGER NOT NULL DEFAULT 0,
    "category_main" "ReportCategory",
    "categories" "ReportCategory"[],
    "is_auto_hidden" BOOLEAN NOT NULL DEFAULT false,
    "auto_action_at" TIMESTAMP(3),
    "assigned_to_id" TEXT,
    "resolved_by_id" TEXT,
    "resolution" "ReportResolution",
    "action_taken" "ModerationActionType",
    "moderator_note" TEXT,
    "first_reported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_reported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "userId" TEXT,

    CONSTRAINT "ReportCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReporterTrust" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "trust_score" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "valid_reports" INTEGER NOT NULL DEFAULT 0,
    "invalid_reports" INTEGER NOT NULL DEFAULT 0,
    "total_reports" INTEGER NOT NULL DEFAULT 0,
    "last_reported_at" TIMESTAMP(3),
    "cooldown_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReporterTrust_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationSignal" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "type" "ModerationSignalType" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationActionLog" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "actor_id" TEXT,
    "action" "ModerationActionType" NOT NULL,
    "previous_status" "ReportStatus",
    "new_status" "ReportStatus",
    "previous_data" JSONB,
    "new_data" JSONB,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationActionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReportCase_active_key_key" ON "ReportCase"("active_key");

-- CreateIndex
CREATE INDEX "ReportCase_status_idx" ON "ReportCase"("status");

-- CreateIndex
CREATE INDEX "ReportCase_severity_idx" ON "ReportCase"("severity");

-- CreateIndex
CREATE INDEX "ReportCase_priority_score_idx" ON "ReportCase"("priority_score");

-- CreateIndex
CREATE INDEX "ReportCase_target_type_target_id_idx" ON "ReportCase"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "ReportCase_created_at_idx" ON "ReportCase"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "ReporterTrust_user_id_key" ON "ReporterTrust"("user_id");

-- CreateIndex
CREATE INDEX "ReporterTrust_trust_score_idx" ON "ReporterTrust"("trust_score");

-- CreateIndex
CREATE INDEX "ModerationSignal_case_id_idx" ON "ModerationSignal"("case_id");

-- CreateIndex
CREATE INDEX "ModerationSignal_type_idx" ON "ModerationSignal"("type");

-- CreateIndex
CREATE INDEX "ModerationSignal_created_at_idx" ON "ModerationSignal"("created_at");

-- CreateIndex
CREATE INDEX "ModerationActionLog_case_id_idx" ON "ModerationActionLog"("case_id");

-- CreateIndex
CREATE INDEX "ModerationActionLog_actor_id_idx" ON "ModerationActionLog"("actor_id");

-- CreateIndex
CREATE INDEX "ModerationActionLog_action_idx" ON "ModerationActionLog"("action");

-- CreateIndex
CREATE INDEX "ModerationActionLog_created_at_idx" ON "ModerationActionLog"("created_at");

-- CreateIndex
CREATE INDEX "Report_reporter_id_idx" ON "Report"("reporter_id");

-- CreateIndex
CREATE INDEX "Report_case_id_idx" ON "Report"("case_id");

-- CreateIndex
CREATE INDEX "Report_category_idx" ON "Report"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Report_case_id_reporter_id_key" ON "Report"("case_id", "reporter_id");

-- AddForeignKey
ALTER TABLE "ReportCase" ADD CONSTRAINT "ReportCase_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCase" ADD CONSTRAINT "ReportCase_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCase" ADD CONSTRAINT "ReportCase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "ReportCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReporterTrust" ADD CONSTRAINT "ReporterTrust_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationSignal" ADD CONSTRAINT "ModerationSignal_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "ReportCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationActionLog" ADD CONSTRAINT "ModerationActionLog_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "ReportCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationActionLog" ADD CONSTRAINT "ModerationActionLog_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
