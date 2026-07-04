-- CreateEnum
CREATE TYPE "Role" AS ENUM ('EMPLOYEE', 'MANAGER', 'ADMIN', 'AUDITOR');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN', 'TERMINATED');

-- CreateEnum
CREATE TYPE "AssetCategory" AS ENUM ('FIXED_ASSET', 'ELECTRONIC_DEVICE', 'SOFTWARE_LICENSE', 'SENSITIVE_DATA');

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "manager_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "department_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_applications" (
    "id" TEXT NOT NULL,
    "applicant_id" TEXT NOT NULL,
    "reason" VARCHAR(100) NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "asset_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_items" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "category" "AssetCategory" NOT NULL,
    "asset_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "asset_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sys_audit_log" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "operator_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "before_status" "ApplicationStatus",
    "after_status" "ApplicationStatus" NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sys_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "asset_applications_applicant_id_status_idx" ON "asset_applications"("applicant_id", "status");

-- CreateIndex
CREATE INDEX "asset_applications_status_created_at_idx" ON "asset_applications"("status", "created_at");

-- CreateIndex
CREATE INDEX "sys_audit_log_application_id_idx" ON "sys_audit_log"("application_id");

-- CreateIndex
CREATE INDEX "sys_audit_log_operator_id_idx" ON "sys_audit_log"("operator_id");

-- CreateIndex
CREATE INDEX "sys_audit_log_created_at_idx" ON "sys_audit_log"("created_at");

-- CreateIndex
CREATE INDEX "sys_audit_log_after_status_created_at_idx" ON "sys_audit_log"("after_status", "created_at");

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_applications" ADD CONSTRAINT "asset_applications_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_items" ADD CONSTRAINT "application_items_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "asset_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sys_audit_log" ADD CONSTRAINT "sys_audit_log_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "asset_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sys_audit_log" ADD CONSTRAINT "sys_audit_log_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
