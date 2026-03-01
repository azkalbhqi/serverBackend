const cron = require("node-cron");
const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const symbols = require("../config/symbols");

const prisma = new PrismaClient();

require("dotenv").config();

const API_KEY = process.env.API_KEY;

// Remove trailing slash if exists
const BASE_URL = (
  process.env.BASE_URL ||
  "https://pro-api.coinmarketcap.com/v1"
).replace(/\/$/, "");

async function fetchAllPrices() {
  try {
    if (!API_KEY) {
      throw new Error("API_KEY not defined in .env");
    }

    const symbolString = symbols.join(",");

    // Build endpoint
    const endpoint = `${BASE_URL}/cryptocurrency/quotes/latest`;

    // Build query string manually (so we can log full URL)
    const params = new URLSearchParams({
      symbol: symbolString,
      convert: "USD"
    });

    const finalUrl = `${endpoint}?${params.toString()}`;

    console.log("🌍 Fetching URL:");
    console.log(finalUrl);

    const res = await axios.get(finalUrl, {
      headers: {
        "X-CMC_PRO_API_KEY": API_KEY,
        Accept: "application/json"
      }
    });

    const allData = res.data.data;

    for (const symbol of symbols) {
      const coin = allData[symbol];
      if (!coin) continue;

      const price = Number(coin.quote.USD.price);

      await prisma.candle.create({
        data: {
          symbol,
          price,
          interval: "1m",
          timestamp: new Date()
        }
      });
    }

    console.log(`✅ Prices updated for: ${symbolString}`);
  } catch (err) {
    console.error("❌ CMC Fetch Error:");
    console.error("Message:", err.message);
    console.error("Code:", err.code);
    console.error("Response:", err.response?.data);
  }
}

function startFetchJob() {
  // Every minute
  cron.schedule("* * * * *", async () => {
    await fetchAllPrices();
  });
}

module.exports = startFetchJob;