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
      draggedDrawing: null,
      drawings: [],
      isMouseOverPane: true,
      lastCrosshairCandle: null,
      selectedDrawingId: null,
      series: null
    }
    this._paneView = new HorizontalLinePaneView(this._state)
    this.onAdd = null
    this.onDragStart = null
    this.onDragEnd = null
    this.onSelect = null
    this.onUpdate = null
    this._container = null
    this.disableChartPanning = null
    this.enableChartPanning = null
  }

  init(container) {
    this._container = container
  }

  update(newState) {
    // Syncs state from React component
    Object.assign(this._state, newState)
    this._requestRedraw()
  }

  chart() {
    return this._state.chart
  }

  series() {
    return this._state.series
  }

  paneViews() {
    return [this._paneView]
  }

  // Initialize the plugin
  attached = ({ chart, series }) => {
    this._state.chart = chart
    this._state.series = series
    this._state.chart.subscribeCrosshairMove(this._handleCrosshairMove)
  }

  // Clean up when plugin is detached
  detached = () => {
    if (this._state.chart) {
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

  handleMouseDown = (event) => {
    if (!this._state.series || !this._state.isMouseOverPane) return

    const clickedDrawing = this._findClickedDrawing(event)

    if (this._state.activeTool === 'cursor' && clickedDrawing) {
      if (this._state.selectedDrawingId !== clickedDrawing.id) {
        if (this.onSelect) this.onSelect(clickedDrawing.id)
      }

      // A draggable item was clicked.
      if (this.disableChartPanning) this.disableChartPanning()

      this._state.draggedDrawing = clickedDrawing
      this._container.style.cursor = 'grabbing'

      if (this.onDragStart) this.onDragStart()
    } else if (this._state.activeTool === 'cursor') {
      // Clicked on empty space.
      if (this.onSelect) this.onSelect(null)
    } else if (this._state.activeTool === 'horzline') {
      const price = this._getActualPrice(event.y)

      if (price !== null && this.onAdd) {
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
  }

  handleMouseUp = () => {
    if (this._state.draggedDrawing) {
      if (this.onUpdate) {
        this.onUpdate(this._state.draggedDrawing)
      }
      this._state.draggedDrawing = null

      if (this.enableChartPanning) this.enableChartPanning()
      this._container.style.cursor = 'pointer'

      if (this.onDragEnd) this.onDragEnd()
    }
  }

  handleMouseMove = (event) => {
    if (this._state.draggedDrawing) {
      const price = this._getActualPrice(event.y)

      if (price !== null) {
        this._state.draggedDrawing.price = price
        this._requestRedraw()
      }
    }
  }

  _getActualPrice = (y_coord) => {
    let price = this._state.series.coordinateToPrice(y_coord)
    if (price === null) return null

    const chartOptions = this._state.chart.options()

    if (
      (chartOptions.crosshair.mode === 3 || chartOptions.crosshair.mode === 1) &&
      this._state.lastCrosshairCandle
    ) {
      const candle = this._state.lastCrosshairCandle
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
    return price
  }

  _updateCursor = (param) => {
    if (!this._container || !this._state.series || !param.point) {
      this._container.style.cursor = ''
      return
    }

    if (this._state.activeTool !== 'cursor') {
      this._container.style.cursor = 'crosshair'
      return
    }

    const eventCoords = { x: param.point.x, y: param.point.y }
    const hoveredDrawing = this._findClickedDrawing(eventCoords)
    this._container.style.cursor = hoveredDrawing ? 'pointer' : ''
  }

  _findClickedDrawing = (eventCoords) => {
    if (!eventCoords || eventCoords.y === undefined) return null

    const currentPrice = this._state.series.coordinateToPrice(eventCoords.y)

    if (currentPrice === null) return null

    const pricePrecision = this._calculatePricePrecision()
    return this._state.drawings.find(
      (drawing) =>
        drawing.type === 'horizontalLine' && Math.abs(drawing.price - currentPrice) < pricePrecision
    )
  }

  _requestRedraw = () => {
    if (this._state.chart) {
      this._state.chart.timeScale().applyOptions({})
    }
  }

  _handleCrosshairMove = (param) => {
    this._state.isMouseOverPane = !!param.point

    if (param.seriesData.has(this._state.series)) {
      this._state.lastCrosshairCandle = param.seriesData.get(this._state.series)
    } else {
      this._state.lastCrosshairCandle = null
    }

    if (!this._state.draggedDrawing) {
      this._updateCursor(param)
    }
  }

  // Helper to make hit testing responsive to zoom level
  _calculatePricePrecision = () => {
    if (!this._state.series) return 1

    const price1 = this._state.series.coordinateToPrice(100)
    const price2 = this._state.series.coordinateToPrice(105)

    if (price1 !== null && price2 !== null) {
      return Math.abs(price1 - price2)
    }
    return 1
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

  // // Request chart update
  // _requestUpdate() {
  //   if (this._state.chart) {
  //     this._state.chart.timeScale().fitContent()
  //   }
  // }
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
            context.strokeStyle = '#2962FF'
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
