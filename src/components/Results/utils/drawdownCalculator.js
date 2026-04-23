/**
 * Calculates the maximum adverse movement (drawdown) for a prediction.
 *
 * Drawdown measures how far the price moved against the prediction direction
 * before moving in the predicted direction. Only calculated for correct predictions.
 *
 * For bullish predictions: Returns negative % (how far price dropped before rising)
 * For bearish predictions: Returns positive % (how far price rose before dropping)
 * For neutral predictions: Returns null (no directional drawdown)
 *
 * @param {Object} prediction - The prediction object
 * @param {number} prediction.timestamp - Unix timestamp of the prediction
 * @param {string} prediction.predictedBias - 'bullish', 'bearish', or 'neutral'
 * @param {number} prediction.accuracy - 1 for correct, 0 for incorrect
 * @param {number} prediction.priceAtPrediction - Price at prediction time
 * @param {Array} chartData - Array of OHLC candles with {time, open, high, low, close}
 * @returns {number|null} Drawdown percentage or null if not applicable
 */
export function calculateDrawdown(prediction, chartData) {
  // Only calculate for correct predictions
  if (prediction.accuracy !== 1) return null;

  // No directional drawdown for neutral predictions
  if (prediction.predictedBias === 'neutral') return null;

  // Validate chartData
  if (!chartData || chartData.length === 0) return null;

  // Find the prediction candle index
  const predictionIndex = chartData.findIndex(
    (candle) => candle.time === prediction.timestamp
  );

  // Return null if prediction not found or is the last candle
  if (predictionIndex === -1 || predictionIndex >= chartData.length - 1) {
    return null;
  }

  // Get the next candle (validation candle)
  const validationCandle = chartData[predictionIndex + 1];
  const predictionClose = prediction.priceAtPrediction;

  // Calculate drawdown based on bias type
  if (prediction.predictedBias === 'bullish') {
    // For bullish: measure how far price dropped (low) before rising
    // Negative percentage indicates drawdown
    return ((validationCandle.low - predictionClose) / predictionClose) * 100;
  } else if (prediction.predictedBias === 'bearish') {
    // For bearish: measure how far price rose (high) before dropping
    // Positive percentage indicates drawdown
    return ((validationCandle.high - predictionClose) / predictionClose) * 100;
  }

  return null;
}
