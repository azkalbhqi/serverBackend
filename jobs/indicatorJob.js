const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");
const calculateEMA = require("../utils/ema");
const symbols = require("../config/symbols");
const prisma = new PrismaClient();

async function processIndicator(symbol) {
  try {
    // Get latest 60 candles
    const candles = await prisma.candle.findMany({
      where: { symbol },
      orderBy: { timestamp: "desc" },
      take: 60
    });

    if (candles.length < 50) {
      console.log(`⚠️ ${symbol}: Not enough data (${candles.length}/50)`);
      return;
    }

    const ordered = candles.reverse();
    const prices = ordered.map(c => c.price);

    const currentPrice = prices[prices.length - 1];
    const firstPrice = prices[0];

    const ema50 = calculateEMA(prices, 50);

    if (!ema50) {
      console.log(`⚠️ ${symbol}: EMA failed`);
      return;
    }

    const trend =
      currentPrice > ema50 ? "UPTREND" : "DOWNTREND";

    const priceChangePoint = currentPrice - firstPrice;
    const priceChangePercent =
      firstPrice !== 0
        ? (priceChangePoint / firstPrice) * 100
        : 0;

    const now = new Date();
    const hourlyTimestamp = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      0,
      0,
      0
    );

    await prisma.indicator.upsert({
      where: {
        symbol_timestamp: {
          symbol,
          timestamp: hourlyTimestamp
        }
      },
      update: {
        ema50,
        trend,
        priceChangePoint,
        priceChangePercent
      },
      create: {
        symbol,
        ema50,
        trend,
        priceChangePoint,
        priceChangePercent,
        timestamp: hourlyTimestamp
      }
    });

    console.log(`📊 ${symbol}: ${trend}`);
  } catch (err) {
    console.error(`❌ ${symbol} indicator error:`, err.message);
  }
}

function startIndicatorJob() {
  cron.schedule(
    "0 * * * *",
    async () => {
      console.log("🚀 Starting Hourly Indicator Job");

      await Promise.allSettled(
        symbols.map(symbol => processIndicator(symbol))
      );
    },
    {
      timezone: "Asia/Jakarta"
    }
  );
}

module.exports = startIndicatorJob;