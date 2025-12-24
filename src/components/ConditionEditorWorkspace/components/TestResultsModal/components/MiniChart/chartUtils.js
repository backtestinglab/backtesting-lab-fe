/**
 * Shared utility functions for chart series rendering
 */

/**
 * Helper to modify alpha channel of rgba color
 * Used for animating opacity in custom series renderers
 * @param {string} rgbaColor - Color string in rgba format (e.g., 'rgba(255, 0, 0, 0.5)')
 * @param {number} opacity - Opacity multiplier (0-1)
 * @returns {string} Modified rgba color string
 */
export function applyOpacity(rgbaColor, opacity) {
  // Match rgba values: rgba(r, g, b, a)
  const match = rgbaColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/)
  if (match) {
    const [, r, g, b, a] = match
    // Multiply original alpha by animated opacity
    const newAlpha = parseFloat(a) * opacity
    return `rgba(${r}, ${g}, ${b}, ${newAlpha})`
  }
  return rgbaColor
}
