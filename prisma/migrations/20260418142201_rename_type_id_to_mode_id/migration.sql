/*
  Warnings:

  - You are about to drop the column `type_id` on the `FocusLog` table. All the data in the column will be lost.
  - You are about to drop the column `type_id` on the `FocusSchedule` table. All the data in the column will be lost.
  - Added the required column `mode_id` to the `FocusLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mode_id` to the `FocusSchedule` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FocusLog" DROP CONSTRAINT "FocusLog_type_id_fkey";

-- DropForeignKey
ALTER TABLE "FocusSchedule" DROP CONSTRAINT "FocusSchedule_type_id_fkey";

-- DropIndex
DROP INDEX "FocusLog_type_id_idx";

-- AlterTable
ALTER TABLE "FocusLog" DROP COLUMN "type_id",
ADD COLUMN     "mode_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "FocusSchedule" DROP COLUMN "type_id",
ADD COLUMN     "mode_id" UUID NOT NULL;

-- CreateIndex
CREATE INDEX "FocusLog_mode_id_idx" ON "FocusLog"("mode_id");

-- AddForeignKey
ALTER TABLE "FocusLog" ADD CONSTRAINT "FocusLog_mode_id_fkey" FOREIGN KEY ("mode_id") REFERENCES "FocusMode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusSchedule" ADD CONSTRAINT "FocusSchedule_mode_id_fkey" FOREIGN KEY ("mode_id") REFERENCES "FocusMode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
