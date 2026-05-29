/*
  Warnings:

  - The `role` column on the `ConversationUser` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `topic_id` on the `Post` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Topic` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Topic` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CONVERSATION_SCOPE" AS ENUM ('GENERAL', 'TOPIC_DISCUSSION', 'CHALLENGE_HELP', 'STUDY_GROUP', 'CLASS_GROUP', 'AI_TUTOR');

-- CreateEnum
CREATE TYPE "ConversationRole" AS ENUM ('OWNER', 'MODERATOR', 'MEMBER');

-- CreateEnum
CREATE TYPE "RecommendationTargetType" AS ENUM ('POST', 'CHALLENGE', 'TOPIC', 'CONVERSATION');

-- DropForeignKey
ALTER TABLE "public"."Post" DROP CONSTRAINT "Post_topic_id_fkey";

-- DropIndex
DROP INDEX "public"."Post_topic_id_created_at_idx";

-- DropIndex
DROP INDEX "public"."Post_topic_id_idx";

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "challenge_id" TEXT,
ADD COLUMN     "scope" "CONVERSATION_SCOPE" NOT NULL DEFAULT 'GENERAL',
ADD COLUMN     "topic_id" TEXT;

-- AlterTable
ALTER TABLE "ConversationUser" DROP COLUMN "role",
ADD COLUMN     "role" "ConversationRole" NOT NULL DEFAULT 'MEMBER';

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "topic_id",
ADD COLUMN     "topicId" TEXT;

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "parent_id" TEXT,
ADD COLUMN     "slug" VARCHAR(150) NOT NULL;

-- CreateTable
CREATE TABLE "UserTopicMastery" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "mastery_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weakness_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "solved_count" INTEGER NOT NULL DEFAULT 0,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "last_practiced_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTopicMastery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostTopic" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,

    CONSTRAINT "PostTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeTopic" (
    "id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "ChallengeTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionAIInsight" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "summary" TEXT,
    "mistake_type" VARCHAR(100),
    "mistake_level" VARCHAR(50),
    "explanation" TEXT,
    "suggestion" TEXT,
    "confidence" DOUBLE PRECISION,
    "model_name" VARCHAR(100),
    "prompt_version" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmissionAIInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionAITopic" (
    "id" TEXT NOT NULL,
    "insight_id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,

    CONSTRAINT "SubmissionAITopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningRecommendation" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "submission_id" TEXT,
    "topic_id" TEXT,
    "reason" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningRecommendationItem" (
    "id" TEXT NOT NULL,
    "recommendation_id" TEXT NOT NULL,
    "target_type" "RecommendationTargetType" NOT NULL,
    "target_id" TEXT NOT NULL,
    "rank" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT,

    CONSTRAINT "LearningRecommendationItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserTopicMastery_topic_id_idx" ON "UserTopicMastery"("topic_id");

-- CreateIndex
CREATE INDEX "UserTopicMastery_user_id_mastery_score_idx" ON "UserTopicMastery"("user_id", "mastery_score");

-- CreateIndex
CREATE UNIQUE INDEX "UserTopicMastery_user_id_topic_id_key" ON "UserTopicMastery"("user_id", "topic_id");

-- CreateIndex
CREATE INDEX "PostTopic_topic_id_idx" ON "PostTopic"("topic_id");

-- CreateIndex
CREATE UNIQUE INDEX "PostTopic_post_id_topic_id_key" ON "PostTopic"("post_id", "topic_id");

-- CreateIndex
CREATE INDEX "ChallengeTopic_topic_id_idx" ON "ChallengeTopic"("topic_id");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeTopic_challenge_id_topic_id_key" ON "ChallengeTopic"("challenge_id", "topic_id");

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionAIInsight_submission_id_key" ON "SubmissionAIInsight"("submission_id");

-- CreateIndex
CREATE INDEX "SubmissionAIInsight_mistake_type_idx" ON "SubmissionAIInsight"("mistake_type");

-- CreateIndex
CREATE INDEX "SubmissionAIInsight_created_at_idx" ON "SubmissionAIInsight"("created_at");

-- CreateIndex
CREATE INDEX "SubmissionAITopic_topic_id_idx" ON "SubmissionAITopic"("topic_id");

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionAITopic_insight_id_topic_id_key" ON "SubmissionAITopic"("insight_id", "topic_id");

-- CreateIndex
CREATE INDEX "LearningRecommendation_user_id_status_idx" ON "LearningRecommendation"("user_id", "status");

-- CreateIndex
CREATE INDEX "LearningRecommendation_topic_id_idx" ON "LearningRecommendation"("topic_id");

-- CreateIndex
CREATE INDEX "LearningRecommendationItem_recommendation_id_idx" ON "LearningRecommendationItem"("recommendation_id");

-- CreateIndex
CREATE INDEX "LearningRecommendationItem_target_type_target_id_idx" ON "LearningRecommendationItem"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "Conversation_scope_idx" ON "Conversation"("scope");

-- CreateIndex
CREATE INDEX "Conversation_topic_id_idx" ON "Conversation"("topic_id");

-- CreateIndex
CREATE INDEX "Conversation_challenge_id_idx" ON "Conversation"("challenge_id");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_slug_key" ON "Topic"("slug");

-- CreateIndex
CREATE INDEX "Topic_category_id_idx" ON "Topic"("category_id");

-- CreateIndex
CREATE INDEX "Topic_parent_id_idx" ON "Topic"("parent_id");

-- AddForeignKey
ALTER TABLE "UserTopicMastery" ADD CONSTRAINT "UserTopicMastery_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTopicMastery" ADD CONSTRAINT "UserTopicMastery_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTopic" ADD CONSTRAINT "PostTopic_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTopic" ADD CONSTRAINT "PostTopic_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "Challenge"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeTopic" ADD CONSTRAINT "ChallengeTopic_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeTopic" ADD CONSTRAINT "ChallengeTopic_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionAIInsight" ADD CONSTRAINT "SubmissionAIInsight_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionAITopic" ADD CONSTRAINT "SubmissionAITopic_insight_id_fkey" FOREIGN KEY ("insight_id") REFERENCES "SubmissionAIInsight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionAITopic" ADD CONSTRAINT "SubmissionAITopic_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningRecommendation" ADD CONSTRAINT "LearningRecommendation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningRecommendation" ADD CONSTRAINT "LearningRecommendation_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningRecommendation" ADD CONSTRAINT "LearningRecommendation_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningRecommendationItem" ADD CONSTRAINT "LearningRecommendationItem_recommendation_id_fkey" FOREIGN KEY ("recommendation_id") REFERENCES "LearningRecommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
