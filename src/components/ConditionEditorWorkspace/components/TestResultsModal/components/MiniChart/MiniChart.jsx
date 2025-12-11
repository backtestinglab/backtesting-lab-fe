import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { CandlestickSeries, createChart, LineSeries } from 'lightweight-charts'
import './MiniChart.css'

const MiniChart = ({ chartData, currentResult, isNextCandleVisible }) => {
  const chartContainerRef = useRef(null)
  const chartRef = useRef(null)
  const candleSeriesRef = useRef(null)
  const indicatorSeriesRef = useRef([])
  const chartDataRef = useRef(chartData)
  const previousResultTimestamp = useRef(null)
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
        secondsVisible: false,
        rightOffset: 8
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
      indicatorSeriesRef.current = []
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

    // Get context count from backend
    const contextCount = currentResult.contextCount || 20

    // Determine visible range
    const startIndex = Math.max(0, currentIndex - contextCount)
    const endIndex = isNextCandleVisible ? currentIndex + 1 : currentIndex

    // Prepare candle data
    const displayData = chartData
      .slice(startIndex, endIndex + 1)
      .map(({ time, open, high, low, close }) => ({
        time,
        open,
        high,
        low,
        close
      }))

    candleSeries.setData(displayData)

    // Set initial OHLC when prediction changes
    const isPredictionChange = previousResultTimestamp.current !== currentResult.timestamp
    if (isPredictionChange && displayData.length > 0) {
      const lastCandle = chartData[endIndex]
      if (lastCandle) {
        setOhlc(lastCandle)
      }
      previousResultTimestamp.current = currentResult.timestamp
    }

    // Remove old indicator series
    indicatorSeriesRef.current.forEach((series) => {
      try {
        chart.removeSeries(series)
      } catch {
        // Series may already be removed
      }
    })
    indicatorSeriesRef.current = []

    // Add indicator lines if present in current result
    if (currentResult.indicators) {
      // PDH line (step function - dashed orange)
      if (currentResult.indicators.pdh && currentResult.indicators.pdh.length > 0) {
        const pdhLine = chart.addSeries(LineSeries, {
          color: '#FF9800',
          lineWidth: 1,
          lineStyle: 2, // Dashed
          lastValueVisible: false,
          priceLineVisible: false
        })

        const pdhData = currentResult.indicators.pdh.map(({ timestamp, value }) => ({
          time: timestamp,
          value
        }))

        pdhLine.setData(pdhData)
        indicatorSeriesRef.current.push(pdhLine)
      }

      // PDL line (step function - dashed dark orange)
      if (currentResult.indicators.pdl && currentResult.indicators.pdl.length > 0) {
        const pdlLine = chart.addSeries(LineSeries, {
          color: '#FF6B00',
          lineWidth: 1,
          lineStyle: 2, // Dashed
          lastValueVisible: false,
          priceLineVisible: false
        })

        const pdlData = currentResult.indicators.pdl.map(({ timestamp, value }) => ({
          time: timestamp,
          value
        }))

        pdlLine.setData(pdlData)
        indicatorSeriesRef.current.push(pdlLine)
      }

      // SMA lines (smooth curves - solid blue)
      Object.keys(currentResult.indicators).forEach((key) => {
        if (key.startsWith('sma') && currentResult.indicators[key].length > 0) {
          const smaLine = chart.addSeries(LineSeries, {
            color: '#2196F3',
            lineWidth: 2,
            lineStyle: 0, // Solid
            lastValueVisible: false,
            priceLineVisible: false
          })

          const smaData = currentResult.indicators[key].map(({ timestamp, value }) => ({
            time: timestamp,
            value
          }))

          smaLine.setData(smaData)
          indicatorSeriesRef.current.push(smaLine)
        }
      })
    }

    // Set visible range AFTER all data and indicators are added
    // Use setVisibleLogicalRange instead of fitContent to control exactly what's visible
    // This shows bars from 0 to end, with 8 bars of space on the right (for rightOffset)
    const totalBars = displayData.length
    chart.timeScale().setVisibleLogicalRange({
      from: 0, // Start from first candle
      to: totalBars - 1 + 8 // End at last candle + 8 bars for right spacing
    })
  }, [currentResult, isNextCandleVisible, chartData])

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
    contextCount: PropTypes.number.isRequired,
    indicators: PropTypes.objectOf(
      PropTypes.arrayOf(
        PropTypes.shape({
          timestamp: PropTypes.number.isRequired,
          value: PropTypes.number.isRequired
        })
      )
    ),
    timestamp: PropTypes.number.isRequired
  }).isRequired,
  isNextCandleVisible: PropTypes.bool.isRequired
}

export default MiniChart
