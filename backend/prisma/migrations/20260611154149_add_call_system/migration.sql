/*
  Warnings:

  - The `status` column on the `Call` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `caller_id` to the `Call` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Call` table without a default value. This is not possible if the table is not empty.
  - Made the column `started_at` on table `Call` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "MESSAGE_TYPE" AS ENUM ('TEXT', 'SYSTEM', 'CALL');

-- CreateEnum
CREATE TYPE "CALL_TYPE" AS ENUM ('AUDIO', 'VIDEO');

-- CreateEnum
CREATE TYPE "CALL_STATUS" AS ENUM ('RINGING', 'ONGOING', 'ENDED', 'MISSED', 'REJECTED', 'CANCELED', 'FAILED');

-- AlterTable
ALTER TABLE "Call" ADD COLUMN     "answered_at" TIMESTAMP(3),
ADD COLUMN     "caller_id" TEXT NOT NULL,
ADD COLUMN     "ended_by_id" TEXT,
ADD COLUMN     "receiver_id" TEXT,
ADD COLUMN     "type" "CALL_TYPE" NOT NULL,
ALTER COLUMN "started_at" SET NOT NULL,
ALTER COLUMN "started_at" SET DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "status",
ADD COLUMN     "status" "CALL_STATUS" NOT NULL DEFAULT 'RINGING';

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "call_id" TEXT,
ADD COLUMN     "type" "MESSAGE_TYPE" NOT NULL DEFAULT 'TEXT';

-- CreateIndex
CREATE INDEX "Call_conversation_id_idx" ON "Call"("conversation_id");

-- CreateIndex
CREATE INDEX "Call_caller_id_idx" ON "Call"("caller_id");

-- CreateIndex
CREATE INDEX "Call_receiver_id_idx" ON "Call"("receiver_id");

-- CreateIndex
CREATE INDEX "Call_status_idx" ON "Call"("status");

-- CreateIndex
CREATE INDEX "Call_started_at_idx" ON "Call"("started_at");

-- CreateIndex
CREATE INDEX "Message_call_id_idx" ON "Message"("call_id");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "Call"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_caller_id_fkey" FOREIGN KEY ("caller_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_ended_by_id_fkey" FOREIGN KEY ("ended_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
