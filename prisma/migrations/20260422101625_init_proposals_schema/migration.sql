-- CreateEnum
CREATE TYPE "DraftStatus" AS ENUM ('generated', 'in_review', 'approved', 'sent');

-- CreateTable
CREATE TABLE "proposals" (
    "id" UUID NOT NULL,
    "enriched_company_id" UUID,
    "use_case" VARCHAR(20) NOT NULL,
    "user_owner" VARCHAR(50) NOT NULL,
    "draft_status" "DraftStatus" NOT NULL DEFAULT 'generated',
    "sections" JSONB NOT NULL DEFAULT '{}',
    "project_title" TEXT NOT NULL,
    "client_name" TEXT NOT NULL,
    "client_industry" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "version" VARCHAR(20) NOT NULL DEFAULT '1.0',
    "ai_provider" VARCHAR(100) NOT NULL,
    "size_bytes" INTEGER NOT NULL DEFAULT 0,
    "input" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "proposals_enriched_company_id_idx" ON "proposals"("enriched_company_id");

-- CreateIndex
CREATE INDEX "proposals_user_owner_idx" ON "proposals"("user_owner");

-- CreateIndex
CREATE INDEX "proposals_draft_status_idx" ON "proposals"("draft_status");

-- CreateIndex
CREATE INDEX "proposals_created_at_idx" ON "proposals"("created_at" DESC);
