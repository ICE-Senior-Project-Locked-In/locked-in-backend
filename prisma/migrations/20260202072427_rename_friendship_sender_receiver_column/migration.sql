/*
  Warnings:

  - You are about to drop the column `addressee_id` on the `Friendship` table. All the data in the column will be lost.
  - You are about to drop the column `requester_id` on the `Friendship` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sender_id,receiver_id]` on the table `Friendship` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `receiver_id` to the `Friendship` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sender_id` to the `Friendship` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_addressee_id_fkey";

-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_requester_id_fkey";

-- DropIndex
DROP INDEX "Friendship_addressee_id_idx";

-- DropIndex
DROP INDEX "Friendship_requester_id_addressee_id_key";

-- DropIndex
DROP INDEX "Friendship_requester_id_idx";

-- AlterTable
ALTER TABLE "Friendship" DROP COLUMN "addressee_id",
DROP COLUMN "requester_id",
ADD COLUMN     "receiver_id" UUID NOT NULL,
ADD COLUMN     "sender_id" UUID NOT NULL;

-- CreateIndex
CREATE INDEX "Friendship_sender_id_idx" ON "Friendship"("sender_id");

-- CreateIndex
CREATE INDEX "Friendship_receiver_id_idx" ON "Friendship"("receiver_id");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_sender_id_receiver_id_key" ON "Friendship"("sender_id", "receiver_id");

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
