/*
  Warnings:

  - Added the required column `type` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('POST_COMMENT', 'COMMENT_REPLY', 'POST_REACTION', 'COMMENT_REACTION', 'MENTION', 'MESSAGE', 'FOLLOW', 'POST_BOOKMARK', 'POST_ACTIVITY', 'POST_MODERATION', 'ACHIEVEMENT', 'SYSTEM');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "actor_id" TEXT,
ADD COLUMN     "ref_id" TEXT,
ADD COLUMN     "ref_sub_id" TEXT,
ADD COLUMN     "type" "NotificationType" NOT NULL;

-- CreateIndex
CREATE INDEX "Notification_user_id_type_idx" ON "Notification"("user_id", "type");
