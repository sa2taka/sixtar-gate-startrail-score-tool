-- CreateEnum
CREATE TYPE "MusicType" AS ENUM ('solar', 'lunar');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('comet', 'nova', 'supernova', 'quasar', 'starlight', 'mystic');

-- CreateEnum
CREATE TYPE "Hazard" AS ENUM ('DEFAULT', 'LV1', 'LV2', 'LV3', 'DEADEND', 'SUDDEN');

-- CreateEnum
CREATE TYPE "Pattern" AS ENUM ('DEFAULT', 'MIRROR', 'RANDOM');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Music" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "englishName" TEXT,
    "bpm" INTEGER,
    "musicLength" INTEGER NOT NULL,
    "link" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Music_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chart" (
    "musicId" TEXT NOT NULL,
    "type" "MusicType" NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "level" INTEGER NOT NULL,
    "notes" INTEGER NOT NULL,
    "combo" INTEGER NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Chart_pkey" PRIMARY KEY ("musicId","type","difficulty")
);

-- CreateTable
CREATE TABLE "Result" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "musicId" TEXT NOT NULL,
    "type" "MusicType" NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "mode" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "blueStar" INTEGER NOT NULL,
    "whiteStar" INTEGER NOT NULL,
    "yellowStar" INTEGER NOT NULL,
    "redStar" INTEGER NOT NULL,
    "isFullCombo" BOOLEAN NOT NULL,
    "hazard" "Hazard" NOT NULL,
    "pattern" "Pattern" NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chart" ADD CONSTRAINT "Chart_musicId_fkey" FOREIGN KEY ("musicId") REFERENCES "Music"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_musicId_type_difficulty_fkey" FOREIGN KEY ("musicId", "type", "difficulty") REFERENCES "Chart"("musicId", "type", "difficulty") ON DELETE RESTRICT ON UPDATE CASCADE;
