import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { CandlestickSeries, createChart, LineSeries } from 'lightweight-charts'
import './MiniChart.css'

const MiniChart = ({
  chartData,
  currentResult,
  formulas,
  isNextCandleVisible,
  onToggleNextCandle
}) => {
  const chartContainerRef = useRef(null)
  const chartRef = useRef(null)
  const candleSeriesRef = useRef(null)
  const chartDataRef = useRef(chartData)
  const [ohlc, setOhlc] = useState(null)

  // Keep chartDataRef updated
  useEffect(() => {
    chartDataRef.current = chartData
  }, [chartData])

  // Initialize chart once
  useEffect(() => {
    if (!chartContainerRef.current) return

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { color: 'transparent' },
        textColor: '#d1d4dc'
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.5)' }
      },
      crosshair: {
        mode: 1
      },
      timeScale: {
        borderColor: '#2B2B43',
        timeVisible: true,
        secondsVisible: false
      },
      rightPriceScale: {
        borderColor: '#2B2B43'
      }
    })

    chartRef.current = chart

    // Add candlestick series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350'
    })

    candleSeriesRef.current = candleSeries

    // Subscribe to crosshair move for dynamic OHLC updates
    const crosshairMoveHandler = (param) => {
      if (param.seriesData.has(candleSeries)) {
        const candleData = param.seriesData.get(candleSeries)
        const currentChartData = chartDataRef.current
        if (currentChartData) {
          const fullDataPoint = currentChartData.find((candle) => candle.time === candleData.time)
          if (fullDataPoint) {
            setOhlc(fullDataPoint)
          }
        }
      }
    }

    chart.subscribeCrosshairMove(crosshairMoveHandler)

    // Cleanup
    return () => {
      chart.unsubscribeCrosshairMove(crosshairMoveHandler)
      chart.remove()
      chartRef.current = null
      candleSeriesRef.current = null
    }
  }, []) // Only initialize once on mount

  // Update chart data when currentResult or visibility changes
  useEffect(() => {
    if (
      !chartRef.current ||
      !candleSeriesRef.current ||
      !chartData ||
      chartData.length === 0 ||
      !currentResult
    )
      return

    const chart = chartRef.current
    const candleSeries = candleSeriesRef.current

    // Find current candle index
    const currentTimestamp = currentResult.timestamp
    const currentIndex = chartData.findIndex((candle) => candle.time === currentTimestamp)

    if (currentIndex === -1) {
      console.warn('Current candle not found in chart data')
      return
    }

    // Calculate context count based on formulas
    // Track the largest SMA period if any SMA indicators are used
    let largestSmaPeriod = 0
    let hasSmaPeriod = false

    Object.values(formulas).forEach((formulaObj) => {
      const formulaString = formulaObj?.formula || formulaObj
      if (typeof formulaString === 'string') {
        const parsed = parseFormulaString(formulaString)
        if (parsed.indicator1.type === 'SMA') {
          largestSmaPeriod = Math.max(largestSmaPeriod, parsed.indicator1.param)
          hasSmaPeriod = true
        }
        if (parsed.indicator2.type === 'SMA') {
          largestSmaPeriod = Math.max(largestSmaPeriod, parsed.indicator2.param)
          hasSmaPeriod = true
        }
      }
    })

    // Set context count: use SMA period if present, otherwise default to 20 for visual context
    const contextCount = hasSmaPeriod ? largestSmaPeriod : 20

    // Determine visible range
    const startIndex = Math.max(0, currentIndex - contextCount)
    const endIndex = isNextCandleVisible ? currentIndex + 1 : currentIndex

    // Prepare candle data
    const displayData = chartData.slice(startIndex, endIndex + 1).map(({ time, open, high, low, close }) => ({
      time,
      open,
      high,
      low,
      close
    }))

    candleSeries.setData(displayData)

    // Set initial OHLC to last candle in displayData
    if (displayData.length > 0) {
      const lastCandle = chartData[endIndex]
      if (lastCandle) {
        setOhlc(lastCandle)
      }
    }

    // Remove old indicator series if they exist
    // (We need to track and remove old series, but for simplicity, let's recreate on each update)
    // TODO: Optimize by tracking series refs and only updating data instead of recreating

    // Add indicator lines if present in current result
    if (currentResult.indicators) {
      // PDH line
      if (
        typeof currentResult.indicators.pdh === 'number' &&
        !isNaN(currentResult.indicators.pdh)
      ) {
        const pdhLine = chart.addSeries(LineSeries, {
          color: '#FF9800',
          lineWidth: 1,
          lineStyle: 2,
          title: 'PDH'
        })

        const pdhData = displayData.map(({ time }) => ({
          time,
          value: currentResult.indicators.pdh
        }))

        pdhLine.setData(pdhData)
      }

      // PDL line
      if (
        typeof currentResult.indicators.pdl === 'number' &&
        !isNaN(currentResult.indicators.pdl)
      ) {
        const pdlLine = chart.addSeries(LineSeries, {
          color: '#FF6B00',
          lineWidth: 1,
          lineStyle: 2,
          title: 'PDL'
        })

        const pdlData = displayData.map(({ time }) => ({
          time,
          value: currentResult.indicators.pdl
        }))

        pdlLine.setData(pdlData)
      }

      // SMA lines - DISABLED until backend provides full historical SMA data
      //
      // Problem: Backend currently only returns ONE SMA value (at current candle timestamp)
      // To draw proper SMA curves, we need SMA values for ALL context candles
      //
      // Current behavior if enabled: Horizontal line at current SMA value (misleading)
      //
      // Solution required: Backend must return full SMA arrays for visible range, or
      // frontend must make separate indicator data request for visible timespan
      //
      // For now, SMA values are displayed in the Prediction Overlay panel only
      //
      // TODO (T021.10.14): Implement full SMA line plotting
      // - Backend: Return full indicator arrays for visible range in test results
      // - Frontend: Plot actual SMA curves instead of horizontal lines
      // - Consider performance impact of calculating extra indicator data
    }

    // Only fit content on first data load (when OHLC is null)
    if (!ohlc) {
      chart.timeScale().fitContent()
    }
  }, [currentResult, isNextCandleVisible, formulas, chartData, ohlc])

  // Parse formula string to extract indicator info
  const parseFormulaString = (formulaString) => {
    // Simple parser - assumes format like "1H SMA(20) > SMA(50)"
    const parts = formulaString.split(/\s+/)
    const result = {
      indicator1: { type: '', param: 0 },
      indicator2: { type: '', param: 0 }
    }

    parts.forEach((part) => {
      const smaMatch = part.match(/SMA\((\d+)\)/)
      if (smaMatch) {
        const param = parseInt(smaMatch[1])
        if (!result.indicator1.type) {
          result.indicator1 = { type: 'SMA', param }
        } else {
          result.indicator2 = { type: 'SMA', param }
        }
      }
      if (part === 'PDH') {
        if (!result.indicator1.type) {
          result.indicator1 = { type: 'PDH', param: 0 }
        } else {
          result.indicator2 = { type: 'PDH', param: 0 }
        }
      }
      if (part === 'PDL') {
        if (!result.indicator1.type) {
          result.indicator1 = { type: 'PDL', param: 0 }
        } else {
          result.indicator2 = { type: 'PDL', param: 0 }
        }
      }
    })

    return result
  }

  return (
    <div className="mini-chart-wrapper">
      {/* OHLC Overlay */}
      {ohlc && (
        <div className="mini-chart-ohlc-overlay">
          <span>
            O <span className="ohlc-value">{ohlc.open?.toFixed(2)}</span>
          </span>
          <span>
            H <span className="ohlc-value">{ohlc.high?.toFixed(2)}</span>
          </span>
          <span>
            L <span className="ohlc-value">{ohlc.low?.toFixed(2)}</span>
          </span>
          <span>
            C <span className="ohlc-value">{ohlc.close?.toFixed(2)}</span>
          </span>
        </div>
      )}

      <div ref={chartContainerRef} className="mini-chart" />

      {/* Show/Hide Next Candle Button */}
      {/* TODO: Move to Prediction Overlay Panel in T021.10.7 */}
      <button className="toggle-next-candle-btn" onClick={onToggleNextCandle}>
        {isNextCandleVisible ? '◼ Hide Next' : '▶ Show Next'}
      </button>
    </div>
  )
}

MiniChart.propTypes = {
  chartData: PropTypes.arrayOf(
    PropTypes.shape({
      close: PropTypes.number.isRequired,
      high: PropTypes.number.isRequired,
      low: PropTypes.number.isRequired,
      open: PropTypes.number.isRequired,
      time: PropTypes.number.isRequired,
      volume: PropTypes.number.isRequired
    })
  ).isRequired,
  currentResult: PropTypes.shape({
    indicators: PropTypes.object,
    timestamp: PropTypes.number.isRequired
  }).isRequired,
  formulas: PropTypes.object.isRequired,
  isNextCandleVisible: PropTypes.bool.isRequired,
  onToggleNextCandle: PropTypes.func.isRequired
}

export default MiniChart
