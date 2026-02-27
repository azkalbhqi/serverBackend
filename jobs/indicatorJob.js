const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");
const calculateEMA = require("../utils/ema");
const symbols = require("../config/symbols");

const prisma = new PrismaClient();

async function processIndicator(symbol) {
  try {
    // 1️⃣ Get last 65 minutes of price data
    const candles = await prisma.candle.findMany({
      where: {
        symbol,
        timestamp: {
          gte: new Date(Date.now() - 65 * 60 * 1000)
        }
      },
      orderBy: { timestamp: "asc" }
    });

    if (candles.length < 50) {
      console.log(`⚠️ ${symbol}: Not enough data (${candles.length}/50)`);
      return;
    }

    // 2️⃣ Use price instead of close
    const prices = candles.map(c => c.price);

    const currentPrice = prices[prices.length - 1];
    const firstPrice = prices[0];

    // 3️⃣ Calculate EMA 50
    const ema50 = calculateEMA(prices, 50);

    // 4️⃣ Trend logic
    const trend =
      currentPrice > ema50 ? "UPTREND" : "DOWNTREND";

    // 5️⃣ 1-hour movement
    const priceChangePoint = currentPrice - firstPrice;
    const priceChangePercent =
      (priceChangePoint / firstPrice) * 100;

    // 6️⃣ Round to start of hour
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

    // 7️⃣ Upsert indicator
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
  // Every hour at minute 0
  cron.schedule("0 * * * *", async () => {
    console.log("🚀 Starting Hourly Indicator Job");

    await Promise.allSettled(
      symbols.map(symbol => processIndicator(symbol))
    );
  });
}

module.exports = startIndicatorJob;