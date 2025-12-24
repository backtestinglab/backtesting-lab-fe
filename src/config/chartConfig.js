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

/**
 * Returns the color for a given zone type with specified opacity
 * @param {string} zoneType - Zone type: 'bullish', 'bearish', or 'neutral'
 * @param {number} opacity - Opacity value between 0 and 1 (default: 0.15)
 * @returns {string} RGBA color string for the zone
 */
export const getZoneColor = (zoneType, opacity = 0.15) => {
  const zoneColors = {
    bearish: CHART_COLORS.bearish,
    bullish: CHART_COLORS.bullish,
    neutral: 'rgba(200, 200, 200, 1)'
  }

  const baseColor = zoneColors[zoneType]
  if (!baseColor) {
    return `rgba(200, 200, 200, ${opacity})`
  }

  // If it's already rgba, extract RGB and apply new opacity
  if (baseColor.startsWith('rgba')) {
    const rgbMatch = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (rgbMatch) {
      return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${opacity})`
    }
  }

  // If it's a hex color, use getColorWithOpacity
  return getColorWithOpacity(baseColor, opacity)
}
