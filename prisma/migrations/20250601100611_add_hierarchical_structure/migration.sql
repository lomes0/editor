/*
  Warnings:

  - Added the required column `type` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('DOCUMENT', 'DIRECTORY');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "parentId" UUID,
ADD COLUMN     "type" "DocumentType" NOT NULL,
ALTER COLUMN "head" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Directory" (
    "id" UUID NOT NULL,
    "documentId" UUID NOT NULL,

    CONSTRAINT "Directory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Directory_documentId_key" ON "Directory"("documentId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Directory" ADD CONSTRAINT "Directory_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
