/*
  Warnings:

  - You are about to drop the column `avatarPublicId` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `coverPublicId` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "avatarPublicId",
DROP COLUMN "coverPublicId",
ADD COLUMN     "avatar_public_id" VARCHAR(255),
ADD COLUMN     "cover_public_id" VARCHAR(255);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "hashed_token" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "device_info" TEXT,
    "last_used_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RefreshToken_user_id_expires_at_idx" ON "RefreshToken"("user_id", "expires_at");

-- CreateIndex
CREATE INDEX "RefreshToken_user_id_revoked_idx" ON "RefreshToken"("user_id", "revoked");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
