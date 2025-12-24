/*
  Warnings:

  - You are about to drop the `UserStatus` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."UserStatus" DROP CONSTRAINT "UserStatus_user_id_fkey";

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "USER_STATUS_TYPE" NOT NULL DEFAULT 'ACTIVE';

-- DropTable
DROP TABLE "public"."UserStatus";

-- CreateIndex
CREATE INDEX "Comment_post_id_created_at_idx" ON "Comment"("post_id", "created_at");

-- CreateIndex
CREATE INDEX "Comment_parentComment_id_idx" ON "Comment"("parentComment_id");

-- CreateIndex
CREATE INDEX "Message_conversation_id_sent_at_idx" ON "Message"("conversation_id", "sent_at");

-- CreateIndex
CREATE INDEX "Notification_user_id_is_read_idx" ON "Notification"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "Notification_user_id_created_at_idx" ON "Notification"("user_id", "created_at");
