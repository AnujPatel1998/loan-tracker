-- Add new text columns alongside the old ones
ALTER TABLE "customers" ADD COLUMN "caseHandlingExecutiveNew" TEXT;
ALTER TABLE "customers" ADD COLUMN "hodNew" TEXT;

-- Backfill from staff_profiles using the existing foreign keys, before we remove them
UPDATE "customers" c
SET "caseHandlingExecutiveNew" = sp."fullName"
FROM "staff_profiles" sp
WHERE c."caseHandlingExecutiveId" = sp.id;

UPDATE "customers" c
SET "hodNew" = sp."fullName"
FROM "staff_profiles" sp
WHERE c."hodId" = sp.id;

-- Drop the old foreign key columns
ALTER TABLE "customers" DROP CONSTRAINT IF EXISTS "customers_caseHandlingExecutiveId_fkey";
ALTER TABLE "customers" DROP CONSTRAINT IF EXISTS "customers_hodId_fkey";
ALTER TABLE "customers" DROP COLUMN "caseHandlingExecutiveId";
ALTER TABLE "customers" DROP COLUMN "hodId";

-- Rename the new columns to their final names
ALTER TABLE "customers" RENAME COLUMN "caseHandlingExecutiveNew" TO "caseHandlingExecutive";
ALTER TABLE "customers" RENAME COLUMN "hodNew" TO "hod";