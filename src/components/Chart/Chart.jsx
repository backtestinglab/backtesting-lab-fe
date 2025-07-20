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
  const chartRef = useRef(null)
  const candleSeriesRef = useRef(null)
  const volumeSeriesRef = useRef(null)
  const pluginRef = useRef(null)
  const [ohlcv, setOhlcv] = useState(null)

  // --- Initialization ---
  useEffect(() => {
    if (!chartContainerRef.current) {
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
    chartRef.current = chart

    // --- Candlestick Series ---
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderDownColor: '#ef5350',
      borderUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      wickUpColor: '#26a69a'
    })
    candleSeriesRef.current = candleSeries

    // --- Plugin Initialization ---
    const horizontalLinePlugin = new HorizontalLinePlugin()
    pluginRef.current = horizontalLinePlugin
    candleSeries.attachPrimitive(horizontalLinePlugin)

    // --- Event Subscription ---
    const handleResize = () => chart.applyOptions({ width: chartContainerRef.current.clientWidth })

    const crosshairMoveHandler = (param) => {
      if (param.seriesData.has(candleSeriesRef.current)) {
        const candleData = param.seriesData.get(candleSeriesRef.current)
        const fullDataPoint = data.find((d) => d.time === candleData.time)
        setOhlcv(fullDataPoint)
      }
    }

    chart.subscribeCrosshairMove(crosshairMoveHandler)

    // --- Event Listeners ---
    window.addEventListener('resize', handleResize)

    // --- Cleanup ---
    return () => {
      chart.unsubscribeCrosshairMove(crosshairMoveHandler)
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [])

  // --- For DATA updates ---
  useEffect(() => {
    if (!candleSeriesRef.current || !chartRef.current || !data) return

    candleSeriesRef.current.setData(data)
    chartRef.current.timeScale().fitContent()

    if (data.length > 0) {
      setOhlcv(data[data.length - 1])
    }
  }, [data])

  // --- Effect for VOLUME visibility updates ---
  useEffect(() => {
    if (!chartRef.current || !data) return

    if (isVolumeVisible) {
      if (!volumeSeriesRef.current) {
        const volumeSeries = chartRef.current.addSeries(HistogramSeries, {
          priceFormat: { type: 'volume' },
          priceScaleId: 'volume_scale',
          lastValueVisible: false
        })
        volumeSeriesRef.current = volumeSeries
      }
      chartRef.current
        .priceScale('volume_scale')
        .applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } })
      const volumeData = data.map((d) => ({
        time: d.time,
        value: d.volume,
        color: d.close >= d.open ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)'
      }))
      volumeSeriesRef.current.setData(volumeData)
    } else {
      if (volumeSeriesRef.current) {
        chartRef.current.removeSeries(volumeSeriesRef.current)
        volumeSeriesRef.current = null
        try {
          chartRef.current.removePriceScale('volume_scale')
        } catch (error) {}
      }
    }
  }, [isVolumeVisible, data])

  // --- For PLUGIN updates (drawings and active tool) ---
  useEffect(() => {
    if (!pluginRef.current) return

    pluginRef.current.onAdd = onDrawingAdd
    pluginRef.current.update({ drawings, activeTool })
  }, [drawings, activeTool, onDrawingAdd])

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
