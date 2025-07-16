import React, { useEffect, useRef, useState } from 'react'
import { CandlestickSeries, ColorType, createChart, HistogramSeries } from 'lightweight-charts'

import './Chart.css'

/**
 * @description Renders a TradingView Lightweight Chart with OHLC overlay.
 */
const Chart = ({ data }) => {
  const chartContainerRef = useRef(null)
  const [ohlcv, setOhlcv] = useState(null)

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'rgba(30, 33, 48, 1)' },
        textColor: '#c0c8e0'
      },
      grid: {
        vertLines: { color: 'rgba(60, 65, 85, 0.5)' },
        horzLines: { color: 'rgba(60, 65, 85, 0.5)' }
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderColor: 'rgba(80, 85, 110, 0.8)'
      },
      crosshair: {
        mode: 1
      }
    })

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderDownColor: '#ef5350',
      borderUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      wickUpColor: '#26a69a'
    })

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: 'volume'
      },
      priceScaleId: 'volume_scale',
      lastValueVisible: false
    })

    chart.priceScale('volume_scale').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0
      }
    })

    const candleData = data
    const volumeData = data.map((d) => ({
      time: d.time,
      value: d.volume,
      color: d.close > d.open ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)'
    }))

    candlestickSeries.setData(candleData)
    volumeSeries.setData(volumeData)

    chart.timeScale().fitContent()

    chart.subscribeCrosshairMove((param) => {
      const candleData = param.seriesData.get(candlestickSeries)
      if (candleData) {
        const volumeDataPoint = param.seriesData.get(volumeSeries)
        setOhlcv({ ...candleData, volume: volumeDataPoint?.value })
      } else {
        const lastCandle = data[data.length - 1]

        if (lastCandle) {
          const lastVolume = volumeData.find(({ time }) => time === lastCandle.time)
          setOhlcv({ ...lastCandle, volume: lastVolume?.value })
        }
      }
    })

    // Handle chart resizing
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth })
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [data])

  return (
    <div className="chart-wrapper">
      {ohlcv && (
        <div className="ohlc-overlay">
          <span>
            O <span className="ohlc-value">{ohlcv.open?.toFixed(2)}</span>
          </span>
          <span>
            H <span className="ohlc-value">{ohlcv.high?.toFixed(2)}</span>
          </span>
          <span>
            L <span className="ohlc-value">{ohlcv.low?.toFixed(2)}</span>
          </span>
          <span>
            C <span className="ohlc-value">{ohlcv.close?.toFixed(2)}</span>
          </span>
          <span>
            Vol <span className="ohlc-value">{ohlcv.volume?.toLocaleString()}</span>
          </span>
        </div>
      )}
      <div ref={chartContainerRef} className="chart-container" />
    </div>
  )
}

export default Chart
