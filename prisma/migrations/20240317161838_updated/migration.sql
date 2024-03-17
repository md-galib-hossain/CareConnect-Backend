-- AlterTable
ALTER TABLE "users" ADD COLUMN     "needsPasswordChange" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
