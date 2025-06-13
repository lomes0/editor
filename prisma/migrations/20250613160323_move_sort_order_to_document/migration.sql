/*
  Warnings:

  - You are about to drop the `Directory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Directory" DROP CONSTRAINT "Directory_documentId_fkey";

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "sort_order" DOUBLE PRECISION;

-- DropTable
DROP TABLE "Directory";
