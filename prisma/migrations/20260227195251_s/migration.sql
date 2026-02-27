/*
  Warnings:

  - You are about to drop the column `ema12` on the `Indicator` table. All the data in the column will be lost.
  - You are about to drop the column `ema26` on the `Indicator` table. All the data in the column will be lost.
  - You are about to drop the column `macd` on the `Indicator` table. All the data in the column will be lost.
  - You are about to drop the column `rsi` on the `Indicator` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Indicator" DROP COLUMN "ema12",
DROP COLUMN "ema26",
DROP COLUMN "macd",
DROP COLUMN "rsi",
ADD COLUMN     "ema50" DOUBLE PRECISION,
ADD COLUMN     "priceChangePercent" DOUBLE PRECISION,
ADD COLUMN     "priceChangePoint" DOUBLE PRECISION,
ADD COLUMN     "trend" TEXT;
