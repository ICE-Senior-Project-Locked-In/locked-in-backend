/*
  Warnings:

  - The values [PET_TOY,PET_COSMETIC] on the enum `ItemType` will be removed. If these variants are still used in the database, this will fail.
  - The values [DOG,CAT,BIRD,FISH,REPTILE] on the enum `PetType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `equipped_inventory_item_id` on the `Pet` table. All the data in the column will be lost.
  - You are about to drop the column `evolutionStage` on the `Pet` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ItemType_new" AS ENUM ('PET_FOOD', 'ROOM_DECOR');
ALTER TABLE "Item" ALTER COLUMN "type" TYPE "ItemType_new" USING ("type"::text::"ItemType_new");
ALTER TYPE "ItemType" RENAME TO "ItemType_old";
ALTER TYPE "ItemType_new" RENAME TO "ItemType";
DROP TYPE "public"."ItemType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PetType_new" AS ENUM ('ORANGE_CAT', 'GRAY_CAT', 'WHITE_CAT');
ALTER TABLE "Pet" ALTER COLUMN "type" TYPE "PetType_new" USING ("type"::text::"PetType_new");
ALTER TYPE "PetType" RENAME TO "PetType_old";
ALTER TYPE "PetType_new" RENAME TO "PetType";
DROP TYPE "public"."PetType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Pet" DROP CONSTRAINT "Pet_equipped_inventory_item_id_fkey";

-- DropIndex
DROP INDEX "Pet_equipped_inventory_item_id_key";

-- AlterTable
ALTER TABLE "Pet" DROP COLUMN "equipped_inventory_item_id",
DROP COLUMN "evolutionStage";

-- DropEnum
DROP TYPE "PetEvolutionStage";

-- CreateTable
CREATE TABLE "FocusSchedule" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type_id" UUID NOT NULL,
    "icon" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FocusSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FocusScheduleDay" (
    "id" UUID NOT NULL,
    "scheduleId" UUID NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,

    CONSTRAINT "FocusScheduleDay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FocusScheduleDay_scheduleId_idx" ON "FocusScheduleDay"("scheduleId");

-- AddForeignKey
ALTER TABLE "FocusSchedule" ADD CONSTRAINT "FocusSchedule_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusSchedule" ADD CONSTRAINT "FocusSchedule_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "FocusType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusScheduleDay" ADD CONSTRAINT "FocusScheduleDay_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "FocusSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
