/*
  Warnings:

  - You are about to drop the column `avatar` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `avatar_public_id` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `fullname` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "avatar",
DROP COLUMN "avatar_public_id",
DROP COLUMN "fullname";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "avatar_public_id" VARCHAR(255),
ADD COLUMN     "fullname" VARCHAR(255);
