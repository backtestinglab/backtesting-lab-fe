/**
 * Parses a color string (hex, rgb, rgba) and returns an object with r, g, b, a components.
 * Returns null if the color string is invalid.
 * @param {string} colorStr The color string to parse.
 * @returns {{r: number, g: number, b: number, a: number} | null} An object with color components or null.
 */
export function parseColor(colorStr) {
  if (typeof colorStr !== 'string') return null

  // Handle RGBA strings
  const rgbaMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1], 10),
      g: parseInt(rgbaMatch[2], 10),
      b: parseInt(rgbaMatch[3], 10),
      a: rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1
    }
  }

  // Handle HEX strings
  if (colorStr.startsWith('#')) {
    let hex = colorStr.slice(1)
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('')
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16),
        a: 1
      }
    }
  }

  return null
}

/**
 * Determines whether to use black or white text based on the background color's luminance.
 * @param {string} backgroundColor The background color string.
 * @returns {'#000000' | '#FFFFFF'} Black or white hex color.
 */
export function getContrastingTextColor(backgroundColor) {
  const rgb = parseColor(backgroundColor)
  if (!rgb) return '#FFFFFF'
  // Formula for perceived luminance (YIQ)
  const luminance = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
  return luminance >= 128 ? '#000000' : '#FFFFFF'
}
