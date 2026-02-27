function calculateEMA(closes, period) {
    let ema = closes[0]
    const k = 2 / (period + 1)
  
    for (let i = 1; i < closes.length; i++) {
      ema = closes[i] * k + ema * (1 - k)
    }
  
    return ema
  }
  
  module.exports = calculateEMA