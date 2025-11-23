/*
  Warnings:

  - You are about to drop the `VaultLocker` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "vault" DROP CONSTRAINT "vault_lockerId_fkey";

-- DropTable
DROP TABLE "VaultLocker";

-- CreateTable
CREATE TABLE "vault_locker" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vault_locker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "model" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model_name" TEXT NOT NULL,
    "model_type" TEXT NOT NULL,
    "vault_key_id" TEXT,
    "configuration" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "model_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vault_locker_name_key" ON "vault_locker"("name");

-- CreateIndex
CREATE INDEX "model_model_type_idx" ON "model"("model_type");

-- CreateIndex
CREATE INDEX "model_provider_idx" ON "model"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "model_provider_model_name_model_type_key" ON "model"("provider", "model_name", "model_type");

-- AddForeignKey
ALTER TABLE "vault" ADD CONSTRAINT "vault_lockerId_fkey" FOREIGN KEY ("lockerId") REFERENCES "vault_locker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "model" ADD CONSTRAINT "model_vault_key_id_fkey" FOREIGN KEY ("vault_key_id") REFERENCES "vault"("id") ON DELETE SET NULL ON UPDATE CASCADE;
