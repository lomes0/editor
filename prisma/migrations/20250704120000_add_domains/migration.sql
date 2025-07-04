-- CreateTable
CREATE TABLE "Domain" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "userId" UUID NOT NULL,
    "color" TEXT,
    "icon" TEXT,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Document" ADD COLUMN "domainId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "Domain_slug_key" ON "Domain"("slug");

-- CreateIndex
CREATE INDEX "Domain_userId_idx" ON "Domain"("userId");

-- CreateIndex
CREATE INDEX "Domain_slug_idx" ON "Domain"("slug");

-- CreateIndex
CREATE INDEX "Domain_name_idx" ON "Domain"("name");

-- CreateIndex
CREATE INDEX "Document_domainId_idx" ON "Document"("domainId");

-- CreateIndex
CREATE INDEX "Document_authorId_domainId_idx" ON "Document"("authorId", "domainId");

-- AddForeignKey
ALTER TABLE "Domain" ADD CONSTRAINT "Domain_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;
