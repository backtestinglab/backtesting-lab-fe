import React, { useEffect, useRef, useState } from 'react'
import { CandlestickSeries, ColorType, createChart } from 'lightweight-charts'

import './Chart.css'

/**
 * @description Renders a TradingView Lightweight Chart with OHLC overlay.
 */
const Chart = ({ data }) => {
  const chartContainerRef = useRef(null)
  const chartRef = useRef(null)
  const seriesRef = useRef(null)
  const [ohlc, setOhlc] = useState(null)

  useEffect(() => {
    if (chartRef.current) return

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

    chartRef.current = chart

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderDownColor: '#ef5350',
      borderUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      wickUpColor: '#26a69a'
    })

    seriesRef.current = candlestickSeries

    chart.subscribeCrosshairMove((param) => {
      const candleData = param.seriesData.get(candlestickSeries)
      if (candleData) {
        setOhlc(candleData)
      } else {
        const seriesData = data[data.length - 1]
        setOhlc(seriesData)
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
      chartRef.current = null
      seriesRef.current = null
    }
  }, [])

  useEffect(() => {
    if (seriesRef.current && data && data.length > 0) {
      seriesRef.current.setData(data)
      chartRef.current.timeScale().fitContent()
    }
  }, [data])

  return (
    <div className="chart-wrapper">
      {ohlc && (
        <div className="ohlc-overlay">
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
      <div ref={chartContainerRef} className="chart-container" />
    </div>
  )
}

export default Chart
