/*
  Warnings:

  - You are about to drop the column `email` on the `UserProfile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `UserProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UserProfile_email_key";

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "email";

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_username_key" ON "UserProfile"("username");
