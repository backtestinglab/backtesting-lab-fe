import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { CandlestickSeries, createChart, LineSeries } from 'lightweight-charts'
import {
  CHART_COLORS,
  getCandlestickSeriesConfig,
  getColorWithOpacity,
  getZoneColor,
  INDICATOR_COLORS
} from '../../../../../../config/chartConfig'
import { isPriceBased } from '../../../../utils/formulaUtils'
import { BackgroundShade } from './BackgroundShade'
import { ZoneSeries } from './ZoneSeries'
import './MiniChart.css'

const MiniChart = ({ chartData, currentResult, formulas, isNextCandleVisible, onHoverData }) => {
  const chartContainerRef = useRef(null)
  const chartRef = useRef(null)
  const candleSeriesRef = useRef(null)
  const indicatorSeriesRef = useRef([])
  const zoneSeriesRef = useRef({
    bullish: null,
    bearish: null,
    neutral: null
  })
  const shadeSeriesRef = useRef({
    bullish: null,
    bearish: null,
    neutral: null
  })
  const zoneVisibility = useRef({
    bullish: false,
    bearish: false,
    neutral: false
  })
  const zoneOpacity = useRef({
    bullish: 0,
    bearish: 0,
    neutral: 0
  })
  const shadeVisibility = useRef({
    bullish: false,
    bearish: false,
    neutral: false
  })
  const shadeOpacity = useRef({
    bullish: 0,
    bearish: 0,
    neutral: 0
  })
  // Store shade data ranges for hover checks (array of continuous ranges)
  const shadeBoundaries = useRef({
    bullish: [],
    bearish: [],
    neutral: []
  })
  // Track which specific range is currently active for each bias type
  const activeShadeRange = useRef({
    bullish: null,
    bearish: null,
    neutral: null
  })
  // Track if the active range is the final chronological range (for skipping last bar)
  const activeShadeRangeIsFinal = useRef({
    bullish: false,
    bearish: false,
    neutral: false
  })
  const currentZoneType = useRef(null)
  const chartDataRef = useRef(chartData)
  const currentResultRef = useRef(currentResult)
  const formulasRef = useRef(formulas)
  const previousResultTimestamp = useRef(null)
  const [ohlc, setOhlc] = useState(null)
  const [indicatorValues, setIndicatorValues] = useState(null)

  // Keep refs updated
  useEffect(() => {
    chartDataRef.current = chartData
  }, [chartData])

  useEffect(() => {
    currentResultRef.current = currentResult
  }, [currentResult])

  useEffect(() => {
    formulasRef.current = formulas
  }, [formulas])

  // Helper function to animate opacity for a given visibility/opacity pair
  const animateOpacityForType = (visibilityRef, opacityRef, fadeSpeed) => {
    let needsUpdate = false
    ;['bullish', 'bearish', 'neutral'].forEach((type) => {
      const targetOpacity = visibilityRef.current[type] ? 1 : 0
      const currentOpacity = opacityRef.current[type]

      if (Math.abs(targetOpacity - currentOpacity) > 0.01) {
        const newOpacity =
          currentOpacity + (targetOpacity > currentOpacity ? fadeSpeed : -fadeSpeed)
        opacityRef.current[type] = Math.max(0, Math.min(1, newOpacity))
        needsUpdate = true
      }
    })
    return needsUpdate
  }

  // Opacity animation loop for smooth fade in/out
  useEffect(() => {
    let animationFrameId

    const animateOpacity = () => {
      const FADE_SPEED = 0.15 // Opacity change per frame

      // Animate both zone and shade opacity
      const zoneNeedsUpdate = animateOpacityForType(zoneVisibility, zoneOpacity, FADE_SPEED)
      const shadeNeedsUpdate = animateOpacityForType(shadeVisibility, shadeOpacity, FADE_SPEED)

      // Trigger chart repaint if any opacity changed
      if ((zoneNeedsUpdate || shadeNeedsUpdate) && chartRef.current) {
        chartRef.current.timeScale().applyOptions({})
      }

      animationFrameId = requestAnimationFrame(animateOpacity)
    }

    animationFrameId = requestAnimationFrame(animateOpacity)

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  // Helper function to get indicator value at a specific timestamp
  const getIndicatorValueAtTime = (indicatorType, param, timestamp) => {
    const currentResult = currentResultRef.current
    if (!currentResult || !currentResult.indicators) return null

    const key =
      indicatorType === 'SMA'
        ? `sma${param}`
        : indicatorType === 'EMA'
          ? `ema${param}`
          : indicatorType.toLowerCase()

    const indicatorArray = currentResult.indicators[key]
    if (!indicatorArray) return null

    const match = indicatorArray.find((item) => item.timestamp === timestamp)
    return match ? match.value : null
  }

  // Evaluate formula for zone detection by substituting hovered price for indicator1
  // Formula structure: indicator1 operator indicator2
  // For zones: we check if hoveredPrice operator indicator2 (boundary)
  const evaluateFormulaForZone = (formula, hoveredPrice, timestamp) => {
    if (!formula) return false

    const { operator, indicator2, indicator2Param } = formula

    // Get the boundary value (indicator2)
    const boundaryValue = getIndicatorValueAtTime(indicator2, indicator2Param, timestamp)

    if (boundaryValue === null) return false

    // Substitute hovered price for indicator1 and evaluate
    switch (operator) {
      case '>':
        return hoveredPrice > boundaryValue
      case '<':
        return hoveredPrice < boundaryValue
      case '>=':
        return hoveredPrice >= boundaryValue
      case '<=':
        return hoveredPrice <= boundaryValue
      case '==':
        // For equality, use a tolerance (e.g., within 0.1% of boundary)
        return Math.abs(hoveredPrice - boundaryValue) / boundaryValue < 0.001
      default:
        return false
    }
  }

  // Calculate which zone a given price falls into based on formulas
  const calculateZoneAtPrice = (price, timestamp) => {
    const formulas = formulasRef.current
    const currentResult = currentResultRef.current

    if (!formulas || !currentResult || !currentResult.indicators) {
      return null
    }

    // Evaluate each formula by substituting hovered price for indicator1
    const bullishConditionMet = evaluateFormulaForZone(formulas.bullish, price, timestamp)
    const bearishConditionMet = evaluateFormulaForZone(formulas.bearish, price, timestamp)
    const neutralConditionMet = evaluateFormulaForZone(formulas.neutral, price, timestamp)

    // TODO: Handle more complex neutral formulas (ranges, percentages, compound conditions)
    // For now, this handles simple indicator comparisons with >, <, >=, <=, ==

    // Determine zone based on which condition is true
    // Priority: bullish > bearish > neutral
    if (bullishConditionMet) {
      return 'bullish'
    }

    if (bearishConditionMet) {
      return 'bearish'
    }

    if (neutralConditionMet) {
      return 'neutral'
    }

    // No condition met - no zone
    return null
  }

  // Evaluate time-based formula to generate shade data
  // Returns { data, ranges } where:
  //   data: array of { time, value } where condition is true
  //   ranges: array of { firstTime, lastTime } for continuous zones
  const evaluateTimeBasedFormula = (formula, indicators) => {
    if (!formula || !indicators) return { data: [], ranges: [] }

    const { indicator1, indicator1Param, operator, indicator2, indicator2Param } = formula

    // Get indicator keys
    const key1 =
      indicator1 === 'SMA'
        ? `sma${indicator1Param}`
        : indicator1 === 'EMA'
          ? `ema${indicator1Param}`
          : indicator1.toLowerCase()

    const key2 =
      indicator2 === 'SMA'
        ? `sma${indicator2Param}`
        : indicator2 === 'EMA'
          ? `ema${indicator2Param}`
          : indicator2.toLowerCase()

    const data1 = indicators[key1]
    const data2 = indicators[key2]

    if (!data1 || !data2) return { data: [], ranges: [] }

    // Evaluate condition at each timestamp and build both data and ranges
    const result = []
    const ranges = []
    let currentRangeStart = null
    let previousTimestamp = null

    for (let i = 0; i < data1.length; i++) {
      const timestamp = data1[i].timestamp
      const value1 = data1[i].value
      const value2Match = data2.find((item) => item.timestamp === timestamp)

      if (!value2Match) continue

      const value2 = value2Match.value
      let conditionMet = false

      switch (operator) {
        case '>':
          conditionMet = value1 > value2
          break
        case '<':
          conditionMet = value1 < value2
          break
        case '>=':
          conditionMet = value1 >= value2
          break
        case '<=':
          conditionMet = value1 <= value2
          break
        case '==':
          conditionMet = Math.abs(value1 - value2) / value2 < 0.001
          break
        default:
          conditionMet = false
      }

      if (conditionMet) {
        // Condition is TRUE
        if (currentRangeStart === null) {
          // Starting a new range
          currentRangeStart = timestamp
        }
        result.push({
          time: timestamp,
          value: 1,
          timestamp
        })
        previousTimestamp = timestamp
      } else {
        // Condition is FALSE
        if (currentRangeStart !== null) {
          // Just ended a range
          ranges.push({
            firstTime: currentRangeStart,
            lastTime: previousTimestamp
          })
          currentRangeStart = null
        }
      }
    }

    // Close final range if we ended on true
    if (currentRangeStart !== null) {
      ranges.push({
        firstTime: currentRangeStart,
        lastTime: previousTimestamp
      })
    }

    return { data: result, ranges }
  }

  // Update zone overlay visualization
  const updateZoneOverlay = (chart, zoneType) => {
    // Hide all zones first
    zoneVisibility.current.bullish = false
    zoneVisibility.current.bearish = false
    zoneVisibility.current.neutral = false

    // Show the active zone
    if (zoneType) {
      zoneVisibility.current[zoneType] = true
    }

    // Trigger chart repaint by calling timeScale().fitContent()
    // This is a lightweight way to trigger redraw without setData()
    chart.timeScale().applyOptions({})
  }

  // Remove zone overlay
  const removeZoneOverlay = (chart) => {
    // Hide all zones
    zoneVisibility.current.bullish = false
    zoneVisibility.current.bearish = false
    zoneVisibility.current.neutral = false

    // Trigger chart repaint
    chart.timeScale().applyOptions({})
  }

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
    const candleSeries = chart.addSeries(CandlestickSeries, getCandlestickSeriesConfig(true))

    candleSeriesRef.current = candleSeries

    // Add persistent zone series (bullish, bearish, neutral)
    // These will be shown/hidden via visibility flags (not setData)
    const bullishZone = chart.addCustomSeries(
      new ZoneSeries(zoneVisibility, zoneOpacity, 'bullish'),
      {
        lineColor: getZoneColor('bullish', 0.8),
        topColor: getZoneColor('bullish', 0.25),
        bottomColor: getZoneColor('bullish', 0.05),
        lineWidth: 2,
        fillDirection: 'up'
      }
    )

    const bearishZone = chart.addCustomSeries(
      new ZoneSeries(zoneVisibility, zoneOpacity, 'bearish'),
      {
        lineColor: getZoneColor('bearish', 0.8),
        topColor: getZoneColor('bearish', 0.25),
        bottomColor: getZoneColor('bearish', 0.05),
        lineWidth: 2,
        fillDirection: 'down'
      }
    )

    const neutralZone = chart.addCustomSeries(
      new ZoneSeries(zoneVisibility, zoneOpacity, 'neutral'),
      {
        lineColor: getZoneColor('neutral', 0.8),
        topColor: getZoneColor('neutral', 0.2),
        bottomColor: getZoneColor('neutral', 0.05),
        lineWidth: 2,
        fillDirection: 'down' // Neutral can fill either direction
      }
    )

    zoneSeriesRef.current = {
      bullish: bullishZone,
      bearish: bearishZone,
      neutral: neutralZone
    }

    // Add persistent shade series (bullish, bearish, neutral) for time-based formulas
    // These will be shown/hidden via visibility flags (not setData)
    const bullishShade = chart.addCustomSeries(
      new BackgroundShade(
        shadeVisibility,
        shadeOpacity,
        activeShadeRange,
        activeShadeRangeIsFinal,
        'bullish'
      ),
      {
        color: getZoneColor('bullish', 0.25)
      }
    )

    const bearishShade = chart.addCustomSeries(
      new BackgroundShade(
        shadeVisibility,
        shadeOpacity,
        activeShadeRange,
        activeShadeRangeIsFinal,
        'bearish'
      ),
      {
        color: getZoneColor('bearish', 0.25)
      }
    )

    const neutralShade = chart.addCustomSeries(
      new BackgroundShade(
        shadeVisibility,
        shadeOpacity,
        activeShadeRange,
        activeShadeRangeIsFinal,
        'neutral'
      ),
      {
        color: getZoneColor('neutral', 0.25)
      }
    )

    shadeSeriesRef.current = {
      bullish: bullishShade,
      bearish: bearishShade,
      neutral: neutralShade
    }

    // Subscribe to crosshair move for dynamic OHLC and indicator updates
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

      // Extract indicator values at hovered timestamp
      const currentResultData = currentResultRef.current
      if (param.time && currentResultData?.indicators) {
        const values = {}
        Object.keys(currentResultData.indicators).forEach((key) => {
          const indicatorArray = currentResultData.indicators[key]
          const match = indicatorArray.find((item) => item.timestamp === param.time)
          if (match) {
            values[key] = match.value
          }
        })
        setIndicatorValues(values)
      }

      // Zone detection: calculate which zone the hovered price falls into
      if (param.point && param.time) {
        const hoveredPrice = candleSeries.coordinateToPrice(param.point.y)
        const zoneType = calculateZoneAtPrice(hoveredPrice, param.time)

        // Notify parent of hover data (for explore mode)
        if (onHoverData) {
          onHoverData({
            price: hoveredPrice,
            zoneType,
            timestamp: param.time
          })
        }

        // Update zone overlay only if zone type changed
        if (zoneType !== currentZoneType.current) {
          updateZoneOverlay(chart, zoneType)
          currentZoneType.current = zoneType
        }

        // Time-based shade range detection
        // Find which specific range (if any) contains the hovered timestamp
        let needsRepaint = false
        ;['bullish', 'bearish', 'neutral'].forEach((shadeType) => {
          const ranges = shadeBoundaries.current[shadeType]
          if (ranges && ranges.length > 0) {
            // Find the range that contains this timestamp
            const matchingRange = ranges.find(
              (range) => param.time >= range.firstTime && param.time <= range.lastTime
            )

            // Update active range if changed
            const previousRange = activeShadeRange.current[shadeType]
            const rangeChanged =
              (matchingRange && !previousRange) ||
              (!matchingRange && previousRange) ||
              (matchingRange &&
                previousRange &&
                (matchingRange.firstTime !== previousRange.firstTime ||
                  matchingRange.lastTime !== previousRange.lastTime))

            if (rangeChanged) {
              activeShadeRange.current[shadeType] = matchingRange || null
              shadeVisibility.current[shadeType] = !!matchingRange

              // Determine if this is the final chronological range overall
              if (matchingRange) {
                // Find the maximum lastTime across all ranges from all shade types
                let maxLastTime = 0
                ;['bullish', 'bearish', 'neutral'].forEach((type) => {
                  const typeRanges = shadeBoundaries.current[type]
                  if (typeRanges && typeRanges.length > 0) {
                    typeRanges.forEach((range) => {
                      if (range.lastTime > maxLastTime) {
                        maxLastTime = range.lastTime
                      }
                    })
                  }
                })
                // This range is final if its lastTime equals the maximum
                activeShadeRangeIsFinal.current[shadeType] = matchingRange.lastTime === maxLastTime
              } else {
                activeShadeRangeIsFinal.current[shadeType] = false
              }

              needsRepaint = true
            }
          }
        })

        // Trigger repaint if any shade visibility changed
        if (needsRepaint) {
          chart.timeScale().applyOptions({})
        }
      } else {
        // Mouse left chart - remove zone overlay and hide shades
        if (currentZoneType.current !== null) {
          removeZoneOverlay(chart)
          currentZoneType.current = null

          // Notify parent that hover ended
          if (onHoverData) {
            onHoverData(null)
          }
        }

        // Hide all shades when mouse leaves
        let needsRepaint = false
        ;['bullish', 'bearish', 'neutral'].forEach((shadeType) => {
          if (shadeVisibility.current[shadeType]) {
            shadeVisibility.current[shadeType] = false
            activeShadeRange.current[shadeType] = null
            needsRepaint = true
          }
        })

        if (needsRepaint) {
          chart.timeScale().applyOptions({})
        }
      }
    }

    chart.subscribeCrosshairMove(crosshairMoveHandler)

    // Cleanup
    return () => {
      chart.unsubscribeCrosshairMove(crosshairMoveHandler)
      // Zone and shade series will be removed when chart is removed
      chart.remove()
      chartRef.current = null
      candleSeriesRef.current = null
      indicatorSeriesRef.current = []
      zoneSeriesRef.current = {
        bullish: null,
        bearish: null,
        neutral: null
      }
      shadeSeriesRef.current = {
        bullish: null,
        bearish: null,
        neutral: null
      }
      currentZoneType.current = null
    }
  }, [])

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

    // Prepare candle data with opacity differentiation
    const displayData = chartData
      .slice(startIndex, endIndex + 1)
      .map(({ time, open, high, low, close }, index) => {
        const globalIndex = startIndex + index
        const isPredictionCandle = globalIndex === currentIndex
        const isNextCandle = globalIndex === currentIndex + 1 && isNextCandleVisible

        // Determine if this is a highlighted candle (prediction or next)
        const isHighlighted = isPredictionCandle || isNextCandle

        // Base candle data
        const candle = { time, open, high, low, close }

        // Add color properties for hollow vs solid differentiation
        if (!isHighlighted) {
          // Context candles: hollow with semi-transparent borders
          const isBullish = close >= open
          const baseColor = isBullish ? CHART_COLORS.bullish : CHART_COLORS.bearish
          candle.color = 'transparent' // Hollow interior
          candle.borderColor = getColorWithOpacity(baseColor, 0.5)
          candle.wickColor = getColorWithOpacity(baseColor, 0.5)
        }
        // Prediction and next candles: solid with full opacity (use default colors)
        // No color properties needed - will use series default

        return candle
      })

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
          color: INDICATOR_COLORS.pdh,
          lineWidth: 2,
          lineStyle: 2, // Dashed
          lineType: 1, // Step line (0 = simple, 1 = with steps, 2 = curved)
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
          color: INDICATOR_COLORS.pdl,
          lineWidth: 2,
          lineStyle: 2, // Dashed
          lineType: 1, // Step line (0 = simple, 1 = with steps, 2 = curved)
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
            color: INDICATOR_COLORS.sma,
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

    // Helper function to process a single formula (price-based or time-based)
    const processFormula = (formula, biasType) => {
      if (!formula) return

      if (isPriceBased(formula)) {
        // Price-based: use ZoneSeries with boundary line
        const { indicator2, indicator2Param } = formula
        const boundaryKey =
          indicator2 === 'SMA'
            ? `sma${indicator2Param}`
            : indicator2 === 'EMA'
              ? `ema${indicator2Param}`
              : indicator2.toLowerCase()

        const boundaryData = currentResult.indicators[boundaryKey]
        if (boundaryData && boundaryData.length > 0 && zoneSeriesRef.current[biasType]) {
          const zoneData = boundaryData.map(({ timestamp, value }) => ({
            time: timestamp,
            value
          }))
          zoneSeriesRef.current[biasType].setData(zoneData)

          // Update lineType option based on indicator type
          const lineType = indicator2 === 'PDH' || indicator2 === 'PDL' ? 'step' : 'simple'
          zoneSeriesRef.current[biasType].applyOptions({ lineType })
        }
      } else {
        // Time-based: use BackgroundShade (hover-controlled)
        const { data: shadeData, ranges } = evaluateTimeBasedFormula(
          formula,
          currentResult.indicators
        )
        if (shadeData.length > 0 && shadeSeriesRef.current[biasType]) {
          shadeSeriesRef.current[biasType].setData(shadeData)
          // Store ranges for hover checks
          shadeBoundaries.current[biasType] = ranges
          // Initially hidden - will show on hover
          shadeVisibility.current[biasType] = false
          activeShadeRange.current[biasType] = null
        }
      }
    }

    // Populate zone/shade series based on formula type
    if (currentResult.indicators && formulas) {
      processFormula(formulas.bullish, 'bullish')
      processFormula(formulas.bearish, 'bearish')
      processFormula(formulas.neutral, 'neutral')
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

  // Helper function to format indicator names for display
  const formatIndicatorName = (key) => {
    if (key === 'pdh') return 'PDH'
    if (key === 'pdl') return 'PDL'
    if (key.startsWith('sma')) {
      const period = key.substring(3)
      return `SMA(${period})`
    }
    if (key.startsWith('ema')) {
      const period = key.substring(3)
      return `EMA(${period})`
    }
    return key.toUpperCase()
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

      {/* Indicator Overlay */}
      {indicatorValues && Object.keys(indicatorValues).length > 0 && (
        <div className="mini-chart-indicator-overlay">
          {Object.entries(indicatorValues).map(([key, value]) => (
            <span key={key} className="indicator-item">
              {formatIndicatorName(key)} <span className="indicator-value">{value.toFixed(2)}</span>
            </span>
          ))}
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
  formulas: PropTypes.object.isRequired,
  isNextCandleVisible: PropTypes.bool.isRequired,
  onHoverData: PropTypes.func
}

export default MiniChart
