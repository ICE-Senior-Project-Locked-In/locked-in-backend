/*
  Warnings:

  - You are about to drop the column `createdAt` on the `FocusSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `FocusSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `FocusSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `FocusSchedule` table. All the data in the column will be lost.
  - Added the required column `end_time` to the `FocusSchedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `FocusSchedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `FocusSchedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `FocusSchedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FocusSchedule" DROP COLUMN "createdAt",
DROP COLUMN "endTime",
DROP COLUMN "startTime",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "end_time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "start_time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
