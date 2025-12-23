/*
  Warnings:

  - A unique constraint covering the columns `[user_id,post_id]` on the table `Reaction` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Reaction_user_id_post_id_type_key";

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_user_id_post_id_key" ON "Reaction"("user_id", "post_id");
