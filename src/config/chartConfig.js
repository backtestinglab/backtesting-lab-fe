/**
 * @description Chart configuration constants and utilities.
 * This serves as the single source of truth for chart colors and series configurations.
 */

// Base chart colors
export const CHART_COLORS = {
  bearish: '#ef5350',
  bullish: '#26a69a'
}

// Indicator line colors
export const INDICATOR_COLORS = {
  pdh: '#FF9800',
  pdl: '#FF6B00',
  sma: '#2196F3'
}

/**
 * Converts a hex color to rgba format with specified opacity
 * @param {string} hexColor - Hex color code (e.g., '#26a69a')
 * @param {number} opacity - Opacity value between 0 and 1
 * @returns {string} RGBA color string
 */
export const getColorWithOpacity = (hexColor, opacity) => {
  // Remove # if present
  const hex = hexColor.replace('#', '')

  // Parse hex to RGB
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

/**
 * Returns candlestick series configuration
 * @param {boolean} borderVisible - Whether to show candle borders (default: false)
 * @returns {object} Candlestick series configuration object
 */
export const getCandlestickSeriesConfig = (borderVisible = false) => ({
  borderDownColor: CHART_COLORS.bearish,
  borderUpColor: CHART_COLORS.bullish,
  borderVisible,
  downColor: CHART_COLORS.bearish,
  upColor: CHART_COLORS.bullish,
  wickDownColor: CHART_COLORS.bearish,
  wickUpColor: CHART_COLORS.bullish
})
