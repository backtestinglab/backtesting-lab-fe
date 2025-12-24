/**
 * Custom TradingView Series Plugin for Zone Visualization
 *
 * Renders a filled zone from a boundary line (e.g., SMA) to the chart edge.
 * Supports both upward fills (bullish) and downward fills (bearish).
 */

import { customSeriesDefaultOptions } from 'lightweight-charts'
import { applyOpacity } from './chartUtils'

/**
 * Zone Series Options
 */
const defaultOptions = {
  ...customSeriesDefaultOptions,
  lineColor: 'rgba(0, 0, 0, 0.6)',
  topColor: 'rgba(0, 0, 0, 0.15)',
  bottomColor: 'rgba(0, 0, 0, 0.05)',
  lineWidth: 2,
  fillDirection: 'down', // 'up' or 'down'
  lineType: 'simple' // 'simple', 'step', or 'curved'
}

/**
 * Zone Series Renderer
 * Draws a filled area from the boundary line to the chart edge
 */
class ZoneSeriesRenderer {
  constructor(visibilityRef, opacityRef, zoneType) {
    this._data = null
    this._options = null
    this._visibilityRef = visibilityRef
    this._opacityRef = opacityRef
    this._zoneType = zoneType
  }

  draw(target, priceConverter) {
    target.useBitmapCoordinateSpace((scope) => {
      // Get current opacity for smooth transitions
      const opacity = this._opacityRef ? this._opacityRef.current[this._zoneType] : 1

      // Skip drawing if opacity is effectively zero
      if (opacity < 0.01) {
        return
      }

      if (!this._data || this._data.bars.length === 0) return

      const ctx = scope.context
      const bars = this._data.bars
      const options = this._options

      // Create path for the boundary line
      const boundaryPath = new Path2D()
      let firstBar = true
      let previousX = 0
      let previousY = 0

      for (const bar of bars) {
        const x = bar.x * scope.horizontalPixelRatio
        const y = priceConverter(bar.originalData.value) * scope.verticalPixelRatio

        if (firstBar) {
          boundaryPath.moveTo(x, y)
          firstBar = false
        } else {
          // Draw based on lineType
          if (options.lineType === 'step') {
            // Stair-step: horizontal first, then vertical
            boundaryPath.lineTo(x, previousY) // horizontal step
            boundaryPath.lineTo(x, y) // vertical jump
          } else if (options.lineType === 'curved') {
            // Curved: use quadratic curve (future implementation)
            const cpX = (previousX + x) / 2
            const cpY = previousY
            boundaryPath.quadraticCurveTo(cpX, cpY, x, y)
          } else {
            // Simple: straight line (default)
            boundaryPath.lineTo(x, y)
          }
        }

        previousX = x
        previousY = y
      }

      // Create filled area path from boundary to chart edge
      const fillPath = new Path2D()
      fillPath.addPath(boundaryPath)

      // Get first and last bar coordinates
      const firstX = bars[0].x * scope.horizontalPixelRatio
      const lastX = bars[bars.length - 1].x * scope.horizontalPixelRatio

      // Determine fill edge based on direction
      let edgeY
      if (options.fillDirection === 'up') {
        // Fill to top of chart
        edgeY = 0
      } else {
        // Fill to bottom of chart
        edgeY = scope.bitmapSize.height
      }

      // Complete the fill path
      fillPath.lineTo(lastX, edgeY)
      fillPath.lineTo(firstX, edgeY)
      fillPath.closePath()

      // Create gradient for fill with animated opacity
      const gradient = ctx.createLinearGradient(0, 0, 0, scope.bitmapSize.height)
      if (options.fillDirection === 'up') {
        gradient.addColorStop(0, applyOpacity(options.topColor, opacity))
        gradient.addColorStop(1, applyOpacity(options.bottomColor, opacity))
      } else {
        gradient.addColorStop(0, applyOpacity(options.bottomColor, opacity))
        gradient.addColorStop(1, applyOpacity(options.topColor, opacity))
      }

      // Draw fill
      ctx.fillStyle = gradient
      ctx.fill(fillPath)

      // Draw boundary line with animated opacity
      ctx.strokeStyle = applyOpacity(options.lineColor, opacity)
      ctx.lineWidth = options.lineWidth * scope.verticalPixelRatio
      ctx.stroke(boundaryPath)

      // Draw zone label
      const centerX = (firstX + lastX) / 2
      let labelY
      const labelText = this._zoneType.toUpperCase()

      // Position based on zone type
      if (options.fillDirection === 'up') {
        // Bullish zone - label at top
        labelY = 40 * scope.verticalPixelRatio
      } else if (this._zoneType === 'neutral') {
        // Neutral zone - label at center
        labelY = scope.bitmapSize.height / 2
      } else {
        // Bearish zone - label at bottom
        labelY = scope.bitmapSize.height - 40 * scope.verticalPixelRatio
      }

      // Draw label text (no background - transparent) with animated opacity
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
    })
  }

  update(data, options) {
    this._data = data
    this._options = options
  }
}

/**
 * Zone Series Implementation
 */
export class ZoneSeries {
  constructor(visibilityRef, opacityRef, zoneType) {
    this._renderer = new ZoneSeriesRenderer(visibilityRef, opacityRef, zoneType)
  }

  priceValueBuilder(plotRow) {
    return [plotRow.value]
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
export const zoneSeriesDefaultOptions = defaultOptions
