-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "delivery_type" TEXT,
ADD COLUMN     "mime_type" TEXT,
ADD COLUMN     "original_name" TEXT,
ADD COLUMN     "public_id" TEXT,
ADD COLUMN     "resource_type" TEXT,
ADD COLUMN     "size" INTEGER;
