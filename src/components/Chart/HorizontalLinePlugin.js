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
      series: null
    }
    this._paneView = new HorizontalLinePaneView(this._state)
    this.onAdd = null
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
  }

  // Clean up when plugin is detached
  detached = () => {
    if (this._state.chart) {
      this._state.chart.unsubscribeClick(this._handleClick)
    }
    this._state.chart = null
    this._state.series = null
  }

  // Handle chart clicks
  _handleClick = (param) => {
    if (!this._state.series || !param.point || this._state.activeTool !== 'horzline') {
      return
    }

    let price = this._state.series.coordinateToPrice(param.point.y)

    if (price === null) return

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
    target.useBitmapCoordinateSpace((scope) => {
      if (!scope.context || !scope.mediaSize.width || !scope.mediaSize.height) {
        console.log('No context or invalid dimensions')
        return
      }

      const context = scope.context
      const pixelRatio = scope.bitmapSize.width / scope.mediaSize.width

      this._state.drawings.forEach((line) => {
        const y = this._state.series.priceToCoordinate(line.price)

        if (y === null) {
          console.log('Price to coordinate returned null')
          return
        }

        const scaledY = y * pixelRatio

        context.beginPath()
        context.strokeStyle = line.color
        context.lineWidth = line.lineWidth * pixelRatio
        context.setLineDash(line.lineStyle === 1 ? [5 * pixelRatio, 5 * pixelRatio] : [])

        context.moveTo(0, scaledY)
        context.lineTo(scope.bitmapSize.width, scaledY)
        context.stroke()

        // // Draw price label
        // context.fillStyle = line.color
        // context.font = `${12 * pixelRatio}px Arial`
        // context.textAlign = 'left'
        // context.textBaseline = 'middle'

        // const priceText = line.price.toFixed(2)
        // const textWidth = ctx.measureText(priceText).width
        // const padding = 4 * pixelRatio

        // // Background for price label
        // context.fillStyle = 'rgba(33, 150, 243, 0.1)'
        // context.fillRect(
        //   10 * pixelRatio,
        //   scaledY - 10 * pixelRatio,
        //   textWidth + padding * 2,
        //   20 * pixelRatio
        // )

        // // Price text
        // context.fillStyle = line.color
        // context.fillText(priceText, (10 + padding) * pixelRatio, scaledY)
      })
    })
  }
}
