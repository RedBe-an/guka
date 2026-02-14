-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('MOCK_6', 'MOCK_9', 'CSAT');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('THEORY', 'SOCIETY', 'SCIENCE', 'HUMAN', 'TECH', 'ART', 'GRAMMAR');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Passages" (
    "id" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "examType" "ExamType" NOT NULL,
    "number" INTEGER NOT NULL,
    "category" "Category" NOT NULL,
    "subject" TEXT NOT NULL,

    CONSTRAINT "Passages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Passages_year_examType_idx" ON "Passages"("year", "examType");

-- CreateIndex
CREATE UNIQUE INDEX "Passages_year_examType_number_key" ON "Passages"("year", "examType", "number");
