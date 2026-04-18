/*
  Warnings:

  - You are about to drop the `FocusType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserFocusType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FocusLog" DROP CONSTRAINT "FocusLog_type_id_fkey";

-- DropForeignKey
ALTER TABLE "FocusSchedule" DROP CONSTRAINT "FocusSchedule_type_id_fkey";

-- DropForeignKey
ALTER TABLE "UserFocusType" DROP CONSTRAINT "UserFocusType_type_id_fkey";

-- DropForeignKey
ALTER TABLE "UserFocusType" DROP CONSTRAINT "UserFocusType_user_id_fkey";

-- DropTable
DROP TABLE "FocusType";

-- DropTable
DROP TABLE "UserFocusType";

-- CreateTable
CREATE TABLE "FocusMode" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "black_listed_apps" TEXT[],
    "user_unblock_action_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FocusMode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FocusMode_user_id_idx" ON "FocusMode"("user_id");

-- AddForeignKey
ALTER TABLE "FocusMode" ADD CONSTRAINT "FocusMode_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusMode" ADD CONSTRAINT "FocusMode_user_unblock_action_id_fkey" FOREIGN KEY ("user_unblock_action_id") REFERENCES "UserUnblockAction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusLog" ADD CONSTRAINT "FocusLog_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "FocusMode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusSchedule" ADD CONSTRAINT "FocusSchedule_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "FocusMode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
