/*
  Warnings:

  - You are about to drop the column `expected_output` on the `Testcase` table. All the data in the column will be lost.
  - You are about to drop the column `input` on the `Testcase` table. All the data in the column will be lost.
  - Added the required column `expected_output_path` to the `Testcase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `input_path` to the `Testcase` table without a default value. This is not possible if the table is not empty.
  - Made the column `score` on table `Testcase` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Testcase" DROP COLUMN "expected_output",
DROP COLUMN "input",
ADD COLUMN     "expected_output_path" TEXT NOT NULL,
ADD COLUMN     "input_path" TEXT NOT NULL,
ALTER COLUMN "score" SET NOT NULL;
