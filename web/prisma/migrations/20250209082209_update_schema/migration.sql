/*
  Warnings:

  - Added the required column `kind` to the `Result` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Kind" AS ENUM ('result', 'musicselect');

-- AlterTable
ALTER TABLE "Result" ADD COLUMN     "kind" TEXT NOT NULL,
ALTER COLUMN "blueStar" DROP NOT NULL,
ALTER COLUMN "whiteStar" DROP NOT NULL,
ALTER COLUMN "yellowStar" DROP NOT NULL,
ALTER COLUMN "redStar" DROP NOT NULL;
