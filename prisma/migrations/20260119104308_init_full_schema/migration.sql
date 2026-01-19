/*
  Warnings:

  - You are about to drop the `Users` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('PET_FOOD', 'PET_TOY', 'PET_COSMETIC');

-- CreateEnum
CREATE TYPE "PetType" AS ENUM ('DOG', 'CAT', 'BIRD', 'FISH', 'REPTILE');

-- CreateEnum
CREATE TYPE "PetEvolutionStage" AS ENUM ('EGG', 'BABY', 'ADULT', 'ELDER');

-- DropTable
DROP TABLE "Users";

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NFCDevice" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "serial_number" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "NFCDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friendship" (
    "id" UUID NOT NULL,
    "requester_id" UUID NOT NULL,
    "addressee_id" UUID NOT NULL,
    "status" "FriendshipStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnblockAction" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnblockAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserUnblockAction" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "action_id" UUID NOT NULL,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserUnblockAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FocusType" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FocusType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFocusType" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type_id" UUID NOT NULL,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserFocusType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FocusLog" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type_id" UUID NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FocusLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "ItemType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInventoryItem" (
    "id" UUID NOT NULL,
    "inventory_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserInventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pet" (
    "id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "type" "PetType" NOT NULL,
    "evolutionStage" "PetEvolutionStage" NOT NULL,
    "equipped_inventory_item_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OAuthAccount" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,

    CONSTRAINT "OAuthAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "NFCDevice_user_id_key" ON "NFCDevice"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "NFCDevice_serial_number_key" ON "NFCDevice"("serial_number");

-- CreateIndex
CREATE INDEX "Friendship_requester_id_idx" ON "Friendship"("requester_id");

-- CreateIndex
CREATE INDEX "Friendship_addressee_id_idx" ON "Friendship"("addressee_id");

-- CreateIndex
CREATE INDEX "Friendship_status_idx" ON "Friendship"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_requester_id_addressee_id_key" ON "Friendship"("requester_id", "addressee_id");

-- CreateIndex
CREATE UNIQUE INDEX "UnblockAction_name_key" ON "UnblockAction"("name");

-- CreateIndex
CREATE INDEX "UserUnblockAction_user_id_idx" ON "UserUnblockAction"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserUnblockAction_user_id_action_id_key" ON "UserUnblockAction"("user_id", "action_id");

-- CreateIndex
CREATE UNIQUE INDEX "FocusType_name_key" ON "FocusType"("name");

-- CreateIndex
CREATE INDEX "UserFocusType_user_id_idx" ON "UserFocusType"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserFocusType_user_id_type_id_key" ON "UserFocusType"("user_id", "type_id");

-- CreateIndex
CREATE INDEX "FocusLog_user_id_idx" ON "FocusLog"("user_id");

-- CreateIndex
CREATE INDEX "FocusLog_type_id_idx" ON "FocusLog"("type_id");

-- CreateIndex
CREATE UNIQUE INDEX "Item_name_key" ON "Item"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_user_id_key" ON "Inventory"("user_id");

-- CreateIndex
CREATE INDEX "UserInventoryItem_inventory_id_idx" ON "UserInventoryItem"("inventory_id");

-- CreateIndex
CREATE INDEX "UserInventoryItem_item_id_idx" ON "UserInventoryItem"("item_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserInventoryItem_inventory_id_item_id_key" ON "UserInventoryItem"("inventory_id", "item_id");

-- CreateIndex
CREATE UNIQUE INDEX "Pet_owner_id_key" ON "Pet"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "Pet_equipped_inventory_item_id_key" ON "Pet"("equipped_inventory_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthAccount_provider_provider_account_id_key" ON "OAuthAccount"("provider", "provider_account_id");

-- AddForeignKey
ALTER TABLE "NFCDevice" ADD CONSTRAINT "NFCDevice_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_addressee_id_fkey" FOREIGN KEY ("addressee_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserUnblockAction" ADD CONSTRAINT "UserUnblockAction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserUnblockAction" ADD CONSTRAINT "UserUnblockAction_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "UnblockAction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFocusType" ADD CONSTRAINT "UserFocusType_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFocusType" ADD CONSTRAINT "UserFocusType_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "FocusType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusLog" ADD CONSTRAINT "FocusLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusLog" ADD CONSTRAINT "FocusLog_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "FocusType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInventoryItem" ADD CONSTRAINT "UserInventoryItem_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "Inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInventoryItem" ADD CONSTRAINT "UserInventoryItem_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_equipped_inventory_item_id_fkey" FOREIGN KEY ("equipped_inventory_item_id") REFERENCES "UserInventoryItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OAuthAccount" ADD CONSTRAINT "OAuthAccount_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
