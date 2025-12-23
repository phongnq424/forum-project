-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "constraints" TEXT,
ADD COLUMN     "difficulty" VARCHAR(20),
ADD COLUMN     "input" TEXT,
ADD COLUMN     "memory_limit" INTEGER,
ADD COLUMN     "output" TEXT,
ADD COLUMN     "time_limit" INTEGER;
