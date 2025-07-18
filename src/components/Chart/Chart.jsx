import React, { useEffect, useRef, useState } from 'react'
import { CandlestickSeries, ColorType, createChart, HistogramSeries } from 'lightweight-charts'
import { HorizontalLinePlugin } from './HorizontalLinePlugin'
import PropTypes from 'prop-types'

import './Chart.css'

/**
 * @description Renders a TradingView Lightweight Chart with OHLCV overlay.
 */
const Chart = ({ activeTool, data, drawings, isVolumeVisible, onDrawingAdd }) => {
  const chartContainerRef = useRef(null)
  const [ohlcv, setOhlcv] = useState(null)

  // --- Initialization ---
  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) {
      return
    }

    // --- Chart Creation ---
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'rgba(30, 33, 48, 1)' },
        textColor: '#c0c8e0'
      },
      grid: {
        vertLines: { color: 'rgba(60, 65, 85, 0.5)' },
        horzLines: { color: 'rgba(60, 65, 85, 0.5)' }
      },
      timeScale: { timeVisible: true, secondsVisible: true, borderColor: 'rgba(80, 85, 110, 0.8)' },
      crosshair: { mode: 0 } // 3 is MagnetOHLC
    })

    // --- Candlestick Series ---
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderDownColor: '#ef5350',
      borderUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      wickUpColor: '#26a69a'
    })
    candleSeries.setData(data)

    // --- Volume Series (Conditional) ---
    let volumeSeries = null
    if (isVolumeVisible) {
      volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: 'volume' },
        priceScaleId: 'volume_scale',
        lastValueVisible: false
      })
      chart.priceScale('volume_scale').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } })
      const volumeData = data.map((d) => ({
        time: d.time,
        value: d.volume,
        color: d.close >= d.open ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)'
      }))
      volumeSeries.setData(volumeData)
    }

    // --- Plugin Initialization ---
    const horizontalLinePlugin = new HorizontalLinePlugin()
    horizontalLinePlugin.onAdd = onDrawingAdd
    horizontalLinePlugin.update({ drawings, activeTool })
    candleSeries.attachPrimitive(horizontalLinePlugin)

    chart.timeScale().fitContent()

    // --- Event Subscription ---
    const handleResize = () => chart.applyOptions({ width: chartContainerRef.current.clientWidth })

    const crosshairMoveHandler = (param) => {
      const candleData = param.seriesData.get(candleSeries)
      if (candleData) {
        const fullDataPoint = data.find(({ time }) => time === candleData.time)
        setOhlcv(fullDataPoint)
      }
    }

    chart.subscribeCrosshairMove(crosshairMoveHandler)

    // Set initial OHLCV display to the last candle
    if (data.length > 0) {
      setOhlcv(data[data.length - 1])
    }

    // --- Event Listeners ---
    window.addEventListener('resize', handleResize)

    // --- Cleanup ---
    return () => {
      chart.unsubscribeCrosshairMove(crosshairMoveHandler)
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [data, drawings, activeTool, isVolumeVisible, onDrawingAdd])

  return (
    <div className="chart-wrapper">
      {ohlcv && (
        <div className="ohlcv-overlay">
          <span>
            O <span className="ohlcv-value">{ohlcv.open?.toFixed(2)}</span>
          </span>
          <span>
            H <span className="ohlcv-value">{ohlcv.high?.toFixed(2)}</span>
          </span>
          <span>
            L <span className="ohlcv-value">{ohlcv.low?.toFixed(2)}</span>
          </span>
          <span>
            C <span className="ohlcv-value">{ohlcv.close?.toFixed(2)}</span>
          </span>
          <span>
            Vol <span className="ohlcv-value">{ohlcv.volume?.toLocaleString()}</span>
          </span>
        </div>
      )}
      <div ref={chartContainerRef} className="chart-container" />
    </div>
  )
}

Chart.propTypes = {
  activeTool: PropTypes.string,
  data: PropTypes.array.isRequired,
  drawings: PropTypes.array.isRequired,
  isVolumeVisible: PropTypes.bool.isRequired,
  onDrawingAdd: PropTypes.func
}

export default Chart
