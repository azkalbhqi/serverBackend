/*
  Warnings:

  - You are about to drop the column `interval` on the `Indicator` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[symbol,timestamp]` on the table `Indicator` will be added. If there are existing duplicate values, this will fail.
  - Made the column `ema50` on table `Indicator` required. This step will fail if there are existing NULL values in that column.
  - Made the column `priceChangePercent` on table `Indicator` required. This step will fail if there are existing NULL values in that column.
  - Made the column `priceChangePoint` on table `Indicator` required. This step will fail if there are existing NULL values in that column.
  - Made the column `trend` on table `Indicator` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Indicator_symbol_interval_timestamp_idx";

-- AlterTable
ALTER TABLE "Indicator" DROP COLUMN "interval",
ALTER COLUMN "ema50" SET NOT NULL,
ALTER COLUMN "priceChangePercent" SET NOT NULL,
ALTER COLUMN "priceChangePoint" SET NOT NULL,
ALTER COLUMN "trend" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Indicator_symbol_timestamp_key" ON "Indicator"("symbol", "timestamp");
