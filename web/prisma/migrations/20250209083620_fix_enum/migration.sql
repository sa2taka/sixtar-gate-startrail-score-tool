/*
  Warnings:

  - The values [musicselect] on the enum `Kind` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Kind_new" AS ENUM ('result', 'select');
ALTER TYPE "Kind" RENAME TO "Kind_old";
ALTER TYPE "Kind_new" RENAME TO "Kind";
DROP TYPE "Kind_old";
COMMIT;
