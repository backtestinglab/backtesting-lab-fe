/**
 * Custom TradingView Series Plugin for Background Shading
 *
 * Renders vertical time-based background shades that span the full chart height.
 * Used for time-based formulas (e.g., SMA(16) > SMA(28)) where the condition is true/false over time.
 * Does NOT affect the price scale (autoscaleInfoProvider returns null).
 */

import { customSeriesDefaultOptions } from 'lightweight-charts'
import { applyOpacity } from './chartUtils'

/**
 * Background Shade Series Options
 */
const defaultOptions = {
  ...customSeriesDefaultOptions,
  color: 'rgba(0, 0, 0, 0.15)'
}

/**
 * Background Shade Series Renderer
 * Draws full-height background fills for time periods when formula is true
 * Only draws bars within the active range
 */
class BackgroundShadeRenderer {
  constructor(visibilityRef, opacityRef, activeRangeRef, activeRangeIsFinalRef, shadeType) {
    this._data = null
    this._options = null
    this._visibilityRef = visibilityRef
    this._opacityRef = opacityRef
    this._activeRangeRef = activeRangeRef
    this._activeRangeIsFinalRef = activeRangeIsFinalRef
    this._shadeType = shadeType
  }

  draw(target) {
    target.useBitmapCoordinateSpace((scope) => {
      // Get current opacity for smooth transitions
      const opacity = this._opacityRef ? this._opacityRef.current[this._shadeType] : 1

      if (opacity < 0.01) {
        return
      }

      if (!this._data || this._data.bars.length === 0) {
        return
      }

      const ctx = scope.context
      const bars = this._data.bars
      const options = this._options

      // Get active range for this shade type
      const activeRange = this._activeRangeRef
        ? this._activeRangeRef.current[this._shadeType]
        : null

      // Check if this is the final chronological range (to skip last bar if true)
      const isFinalRange = this._activeRangeIsFinalRef
        ? this._activeRangeIsFinalRef.current[this._shadeType]
        : false

      // Fill background for each active bar with animated opacity
      ctx.fillStyle = applyOpacity(options.color, opacity)

      let activeCount = 0
      let firstActiveX = null
      let lastActiveX = null
      const drawnBars = []

      // Draw bars in the active range (skip last bar only if this is the final range)
      const maxIndex = isFinalRange ? bars.length - 1 : bars.length
      for (let i = 0; i < maxIndex; i++) {
        const bar = bars[i]
        const isActive = bar.originalData.value === 1

        // Check if this bar is within the active range
        // Use bar.originalData.timestamp which we preserved from the source data
        const barTimestamp = bar.originalData.timestamp
        const isInActiveRange = activeRange && barTimestamp
          ? barTimestamp >= activeRange.firstTime && barTimestamp <= activeRange.lastTime
          : false

        if (isActive && isInActiveRange) {
          activeCount++
          const x = bar.x * scope.horizontalPixelRatio

          if (firstActiveX === null) {
            firstActiveX = x
          }
          lastActiveX = x

          // Calculate width to next bar
          let width
          const isLastBar = i === bars.length - 1

          if (!isLastBar) {
            // Not the last bar - check if next bar is in the active range
            const nextBar = bars[i + 1]
            const nextBarTimestamp = nextBar.originalData.timestamp
            const nextBarInRange = activeRange && nextBarTimestamp
              ? nextBarTimestamp >= activeRange.firstTime && nextBarTimestamp <= activeRange.lastTime
              : false

            if (nextBarInRange) {
              // Next bar is in the same range, use it for width calculation
              const nextX = nextBar.x * scope.horizontalPixelRatio
              width = nextX - x
            } else {
              // Next bar is NOT in the same range, use consistent width
              width = drawnBars.length > 0
                ? drawnBars[drawnBars.length - 1].width
                : 60 * scope.horizontalPixelRatio
            }
          } else {
            // Last bar - use the same width as the previous bar
            width = drawnBars.length > 0
              ? drawnBars[drawnBars.length - 1].width
              : 60 * scope.horizontalPixelRatio
          }

          drawnBars.push({ index: i, timestamp: barTimestamp, x, width })
          ctx.fillRect(x, 0, width, scope.bitmapSize.height)
        }
      }

      // Draw shade type label if there are active bars
      if (activeCount > 0 && firstActiveX !== null && lastActiveX !== null) {
        const centerX = (firstActiveX + lastActiveX) / 2
        const labelText = this._shadeType.toUpperCase()
        let labelY

        if (this._shadeType === 'bullish') {
          // label at top
          labelY = 40 * scope.verticalPixelRatio
        } else if (this._shadeType === 'neutral') {
          // label at center
          labelY = scope.bitmapSize.height / 2
        } else {
          // label at bottom
          labelY = scope.bitmapSize.height - 40 * scope.verticalPixelRatio
        }

        // Draw label text with animated opacity
        ctx.font = `bold ${18 * scope.verticalPixelRatio}px Arial, sans-serif`
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        // Add text shadow for better visibility with animated opacity
        ctx.shadowColor = `rgba(0, 0, 0, ${0.8 * opacity})`
        ctx.shadowBlur = 4 * scope.verticalPixelRatio
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0

        ctx.fillText(labelText, centerX, labelY)

        // Reset shadow
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
      }
    })
  }

  update(data, options) {
    this._data = data
    this._options = options
  }
}

/**
 * Background Shade Series Implementation
 */
export class BackgroundShade {
  constructor(visibilityRef, opacityRef, activeRangeRef, activeRangeIsFinalRef, shadeType) {
    this._renderer = new BackgroundShadeRenderer(visibilityRef, opacityRef, activeRangeRef, activeRangeIsFinalRef, shadeType)
  }

  priceValueBuilder() {
    // Return empty array to prevent this series from affecting price scale autoscaling
    // The values (0 or 1) are just markers for shading, not actual prices
    return []
  }

  isWhitespace(data) {
    return data.value === undefined
  }

  renderer() {
    return this._renderer
  }

  update(data, options) {
    this._renderer.update(data, options)
  }

  defaultOptions() {
    return defaultOptions
  }
}

/**
 * Default options accessor
 */
export const backgroundShadeDefaultOptions = defaultOptions
