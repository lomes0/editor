-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_domainId_fkey";

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;
