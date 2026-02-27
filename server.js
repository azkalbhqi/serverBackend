require("dotenv").config()

const express = require("express")
const { PrismaClient } = require("./generated/prisma")
const startFetchJob = require("./jobs/fetchJob")
const startIndicatorJob = require("./jobs/indicatorJob")

const prisma = new PrismaClient()

const app = express()
app.use(express.json())
/**
 * Health Check
 */
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({
      status: "OK",
      database: "Connected",
      timestamp: new Date()
      
    })
  } catch (err) {
    res.status(500).json({
      status: "ERROR",
      database: "Disconnected",
      error: err.message
    })
  }
})

/**
 * Get latest trend per symbol
 * Example:
 * GET /trend/BTCUSDT
 */
app.get("/trend/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params.symbol.toUpperCase()
    const latest = await prisma.indicator.findFirst({
      where: { symbol },
      orderBy: { timestamp: "desc" }
    })

    if (!latest) {
      return res.status(404).json({
        message: "No indicator data found for this symbol"
      })
    }

    res.json(latest)
  } catch (err) {
    res.status(500).json({
      error: err.message
    })
  }
})

/**
 * Get latest candle (debug endpoint)
 */
app.get("/price/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params.symbol.toUpperCase()

    const latest = await prisma.candle.findFirst({
      where: { symbol },
      orderBy: { timestamp: "desc" }
    })

    res.json(latest)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})


app.get("/debug/candles", async (req, res) => {
  const all = await prisma.candle.findMany()
  res.json(all)
})

/**
 * Start background jobs
 */
startFetchJob()
startIndicatorJob()

/**
 * Start server
 */
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("===================================")
  console.log(`🚀 Server running on port ${PORT}`)
  console.log("⏱ Fetch Job: Every 1 minute")
  console.log("📈 Indicator Job: Every 1 hour")
  console.log("===================================")
})