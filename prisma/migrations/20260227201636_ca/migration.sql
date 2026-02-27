/*
  Warnings:

  - You are about to drop the column `close` on the `Candle` table. All the data in the column will be lost.
  - You are about to drop the column `high` on the `Candle` table. All the data in the column will be lost.
  - You are about to drop the column `low` on the `Candle` table. All the data in the column will be lost.
  - You are about to drop the column `open` on the `Candle` table. All the data in the column will be lost.
  - You are about to drop the column `volume` on the `Candle` table. All the data in the column will be lost.
  - Added the required column `price` to the `Candle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Candle" DROP COLUMN "close",
DROP COLUMN "high",
DROP COLUMN "low",
DROP COLUMN "open",
DROP COLUMN "volume",
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;
