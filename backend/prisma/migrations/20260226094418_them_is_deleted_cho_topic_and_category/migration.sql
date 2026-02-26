-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;
