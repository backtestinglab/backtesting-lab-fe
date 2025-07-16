import React, { useEffect, useRef, useState } from 'react'
import { CandlestickSeries, ColorType, createChart, HistogramSeries } from 'lightweight-charts'
import PropTypes from 'prop-types'

import './Chart.css'

/**
 * @description Renders a TradingView Lightweight Chart with OHLC overlay.
 */
const Chart = ({ data, isVolumeVisible }) => {
  const chartContainerRef = useRef(null)
  const [ohlcv, setOhlcv] = useState(null)

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) {
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
      crosshair: { mode: 1 }
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
        priceScaleId: 'volume_scale'
      })
      chart.priceScale('volume_scale').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } })

      const volumeData = data.map((d) => ({
        time: d.time,
        value: d.volume,
        color: d.close >= d.open ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)'
      }))
      volumeSeries.setData(volumeData)
    }

    chart.timeScale().fitContent()

    // --- Event Subscription ---
    chart.subscribeCrosshairMove((param) => {
      const candleData = param.seriesData.get(candleSeries)

      if (candleData) {
        const fullDataPoint = data.find(({ time }) => time === candleData.time)
        setOhlcv(fullDataPoint)
      }
    })

    if (data.length > 0) {
      setOhlcv(data[data.length - 1])
    }

    // --- Cleanup ---
    const handleResize = () => chart.applyOptions({ width: chartContainerRef.current.clientWidth })
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [data, isVolumeVisible])

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
  data: PropTypes.array.isRequired,
  isVolumeVisible: PropTypes.bool.isRequired
}

export default Chart
