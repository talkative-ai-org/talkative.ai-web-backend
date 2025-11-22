/*
  Warnings:

  - Added the required column `lockerId` to the `vault` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "vault" ADD COLUMN     "lockerId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "VaultLocker" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VaultLocker_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VaultLocker_name_key" ON "VaultLocker"("name");

-- AddForeignKey
ALTER TABLE "vault" ADD CONSTRAINT "vault_lockerId_fkey" FOREIGN KEY ("lockerId") REFERENCES "VaultLocker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
