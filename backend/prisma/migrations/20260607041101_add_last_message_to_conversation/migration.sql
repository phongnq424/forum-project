/*
  Warnings:

  - The values [FILE] on the enum `FILE_TYPE` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FILE_TYPE_new" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT', 'OTHER');
ALTER TABLE "Attachment" ALTER COLUMN "file_type" TYPE "FILE_TYPE_new" USING ("file_type"::text::"FILE_TYPE_new");
ALTER TYPE "FILE_TYPE" RENAME TO "FILE_TYPE_old";
ALTER TYPE "FILE_TYPE_new" RENAME TO "FILE_TYPE";
DROP TYPE "public"."FILE_TYPE_old";
COMMIT;

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "last_message_at" TIMESTAMP(3),
ADD COLUMN     "last_message_id" TEXT;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "conversationId" TEXT;

-- CreateIndex
CREATE INDEX "Conversation_last_message_at_idx" ON "Conversation"("last_message_at");

-- CreateIndex
CREATE INDEX "Message_conversation_id_is_deleted_sent_at_idx" ON "Message"("conversation_id", "is_deleted", "sent_at");

-- CreateIndex
CREATE INDEX "Message_conversation_id_is_read_is_deleted_sender_id_idx" ON "Message"("conversation_id", "is_read", "is_deleted", "sender_id");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_last_message_id_fkey" FOREIGN KEY ("last_message_id") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
