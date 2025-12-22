/*
  Warnings:

  - Made the column `workingYear` on table `UserProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `workingMonth` on table `UserProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "UserProfile" ALTER COLUMN "workingYear" SET NOT NULL,
ALTER COLUMN "workingMonth" SET NOT NULL;
