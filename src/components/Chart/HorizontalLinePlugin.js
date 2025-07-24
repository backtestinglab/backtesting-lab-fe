/**
 * @class HorizontalLinePlugin
 * @description The main plugin class that manages state and interaction.
 */
// Horizontal Line Plugin Class
export class HorizontalLinePlugin {
  constructor() {
    this._state = {
      activeTool: 'cursor',
      chart: null,
      drawings: [],
      magnetMode: 0,
      selectedDrawingId: null,
      series: null
    }
    this._paneView = new HorizontalLinePaneView(this._state)
    this.onAdd = null
    this.onSelect = null
    this._container = null
  }

  init(container) {
    this._container = container
  }

  update(newState) {
    // Syncs state from React component
    Object.assign(this._state, newState)
    if (this._state.chart) {
      this._state.chart.timeScale().applyOptions({})
    }
  }

  // Required method for plugins
  chart() {
    return this._state.chart
  }

  // Required method for plugins
  series() {
    return this._state.series
  }

  // Required method for plugins
  paneViews() {
    return [this._paneView]
  }

  // Initialize the plugin
  attached = ({ chart, series }) => {
    this._state.chart = chart
    this._state.series = series
    chart.subscribeClick(this._handleClick)
    chart.subscribeCrosshairMove(this._handleCrosshairMove)
  }

  // Clean up when plugin is detached
  detached = () => {
    if (this._state.chart) {
      this._state.chart.unsubscribeClick(this._handleClick)
      this._state.chart.unsubscribeCrosshairMove(this._handleCrosshairMove)
    }
    this._state.chart = null
    this._state.series = null
  }

  priceAxisViews() {
    if (!this._state.series) {
      return []
    }

    return this._state.drawings
      .filter(({ type }) => type === 'horizontalLine')
      .map((line) => {
        const isSelected = line.id === this._state.selectedDrawingId
        return new HorizontalLineAxisView({
          series: this._state.series,
          price: line.price,
          color: line.color,
          isSelected: isSelected
        })
      })
  }

  // NEW: Handler for mouse movement
  _handleCrosshairMove = (param) => {
    if (!this._state.series || !param.point) {
      return
    }

    let cursorStyle = ''
    const currentPrice = this._state.series.coordinateToPrice(param.point.y)
    if (currentPrice === null) return

    const pricePrecision = this._calculatePricePrecision()
    const hoveredDrawing = this._state.drawings.find(
      (drawing) =>
        drawing.type === 'horizontalLine' && Math.abs(drawing.price - currentPrice) < pricePrecision
    )

    if (hoveredDrawing) {
      cursorStyle = 'grab'
    }

    if (this._state.activeTool !== 'cursor') {
      cursorStyle = 'crosshair'
    }

    if (this._container) {
      this._container.style.cursor = cursorStyle
    }
  }

  // NEW: Helper to make hit testing responsive to zoom level
  _calculatePricePrecision = () => {
    const coordinate1 = 100
    const coordinate2 = 105
    const price1 = this._state.series.coordinateToPrice(coordinate1)
    const price2 = this._state.series.coordinateToPrice(coordinate2)

    if (price1 !== null && price2 !== null) {
      return Math.abs(price1 - price2)
    }
    return 1
  }

  // Handle chart clicks
  _handleClick = (param) => {
    if (!this._state.series || !param.point) {
      return
    }

    let price = this._state.series.coordinateToPrice(param.point.y)
    const pricePrecision = this._calculatePricePrecision()

    if (price === null) return

    // --- 1. Check if we clicked on an existing line (Hit Testing) ---
    const clickedDrawing = this._state.drawings.find(
      (drawing) =>
        drawing.type === 'horizontalLine' && Math.abs(drawing.price - price) < pricePrecision
    )

    if (clickedDrawing) {
      if (this.onSelect) this.onSelect(clickedDrawing.id)
      return
    }

    // --- 2. If no line was clicked, deselect any currently selected line ---
    if (this._state.selectedDrawingId !== null && this._state.activeTool === 'cursor') {
      if (this.onSelect) this.onSelect(null)
    }

    // --- 3. If in drawing mode, draw a new line ---
    if (this._state.activeTool !== 'horzline') return

    if (
      (this._state.magnetMode === 3 || this._state.magnetMode === 1) &&
      param.seriesData.has(this._state.series)
    ) {
      const candle = param.seriesData.get(this._state.series)
      const prices = [candle.open, candle.high, candle.low, candle.close]

      let closestPrice = prices[0]
      let minDistance = Math.abs(closestPrice - price)

      for (let i = 1; i < prices.length; i++) {
        const distance = Math.abs(prices[i] - price)
        if (distance < minDistance) {
          minDistance = distance
          closestPrice = prices[i]
        }
      }
      price = closestPrice
    }

    if (this.onAdd) {
      this.onAdd({
        color: 'rgba(200, 220, 255, 0.7)',
        id: Date.now(),
        lineWidth: 1,
        lineStyle: 0, // solid line
        type: 'horizontalLine',
        price
      })
    }
  }

  // Remove a line by ID
  // removeLine(id) {
  //   const index = this._lines.findIndex((line) => line.id === id)
  //   if (index !== -1) {
  //     this._lines.splice(index, 1)
  //     this._requestUpdate()
  //   }
  // }

  // Get all lines
  // getLines() {
  //   return this._lines
  // }

  // Clear all lines
  // clearLines() {
  //   this._lines = []
  //   this._requestUpdate()
  // }

  // Request chart update
  _requestUpdate() {
    if (this._state.chart) {
      this._state.chart.timeScale().fitContent()
    }
  }
}

/**
 * @class HorizontalLineAxisView
 * @description Renders a label on the price axis for a horizontal line.
 */
class HorizontalLineAxisView {
  constructor(state) {
    this._state = state
  }

  coordinate() {
    if (!this._state.series) return 0
    return this._state.series.priceToCoordinate(this._state.price) ?? 0
  }

  text() {
    if (!this._state.series) return ''
    return this._state.series.priceFormatter().format(this._state.price)
  }

  textColor() {
    return this._state.isSelected ? '#FFFFFF' : '#D1D4DC'
  }

  backColor() {
    return this._state.isSelected ? 'rgba(41, 98, 255, 1)' : 'rgba(120, 120, 120, 1)'
  }
  borderColor() {
    return this._state.isSelected ? '#2962FF' : 'rgba(120, 120, 120, 1)'
  }
}

/**
 * @class HorizontalLinePaneView
 * @description This class acts as the "view" for the pane. Its main job
 * is to provide the renderer object to the chart.
 */
class HorizontalLinePaneView {
  constructor(state) {
    this._renderer = new HorizontalLineRenderer(state)
  }

  update() {
    // This method is called when the chart needs to update
  }

  renderer() {
    return this._renderer
  }
}

/**
 * @class HorizontalLineRenderer
 * @description This class is responsible for the actual drawing on the canvas.
 * It has the `draw` method that the chart calls on every frame.
 */
class HorizontalLineRenderer {
  constructor(state) {
    this._state = state
  }

  draw(target) {
    target.useBitmapCoordinateSpace(({ bitmapSize, context, mediaSize }) => {
      if (!context || !mediaSize.width || !mediaSize.height) {
        console.log('No context or invalid dimensions')
        return
      }

      const pixelRatio = bitmapSize.width / mediaSize.width

      this._state.drawings.forEach((line) => {
        if (line.type === 'horizontalLine') {
          const isSelected = line.id === this._state.selectedDrawingId
          const y = this._state.series.priceToCoordinate(line.price)

          if (y === null) {
            console.log('Price to coordinate returned null')
            return
          }

          const scaledY = y * pixelRatio

          context.beginPath()
          context.strokeStyle = isSelected ? '#2962FF' : line.color
          context.lineWidth = line.lineWidth * pixelRatio + (isSelected ? 1 : 0)
          context.setLineDash(line.lineStyle === 1 ? [5 * pixelRatio, 5 * pixelRatio] : [])

          context.moveTo(0, scaledY)
          context.lineTo(bitmapSize.width, scaledY)
          context.stroke()

          // --- Draw selection handles if selected ---
          if (isSelected) {
            const handleSize = line.lineWidth + 4
            context.fillStyle = '#FFFFFF'
            context.strokeStyle = '#2962FF' // Blue border for handles
            context.lineWidth = line.lineWidth

            // Left handle
            context.beginPath()
            context.rect(0, scaledY - handleSize, handleSize * 2, handleSize * 2)
            context.fill()
            context.stroke()

            // Right handle
            context.beginPath()
            context.rect(
              bitmapSize.width - handleSize * 2,
              scaledY - handleSize,
              handleSize * 2,
              handleSize * 2
            )
            context.fill()
            context.stroke()
          }
        }
      })
    })
  }
}
