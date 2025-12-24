import React, { useState } from 'react'
import PropTypes from 'prop-types'
import './PredictionOverlay.css'

const PredictionOverlay = ({
  currentIndex,
  currentResult,
  formulas,
  hasTimeBasedFormulas,
  hoverData,
  isNextCandleVisible,
  onNext,
  onPrevious,
  onToggleNextCandle,
  totalPredictions
}) => {
  const [isExploreMode, setIsExploreMode] = useState(false)
  // Get the formula that matches this prediction
  const formula = formulas[currentResult.predictedBias]

  // Helper to get indicator value at a given timestamp and optionally override indicator1 with a specific price
  const getIndicatorValue = (indicatorType, param, timestamp = null, overridePrice = null) => {
    // If this is indicator1 in explore mode with hover, use the hovered price
    if (overridePrice !== null && indicatorType === 'Value') {
      return overridePrice
    }

    // Handle custom value
    if (indicatorType === 'Value') {
      return param // Static value, not an indicator
    }

    if (['Close', 'Open', 'High', 'Low'].includes(indicatorType)) {
      // In explore mode with hover, use the hovered price for indicator1
      if (overridePrice !== null) {
        return overridePrice
      }
      // Otherwise, get from current result's price data
      return currentResult[`priceAt${indicatorType}`] || currentResult.priceAtPrediction || null
    }

    if (!currentResult.indicators) return null

    // Build indicator key
    let key = null
    if (indicatorType === 'SMA') {
      key = `sma${param}`
    } else if (indicatorType === 'EMA') {
      key = `ema${param}`
    } else if (indicatorType === 'RSI') {
      key = `rsi${param}`
    } else if (indicatorType === 'PDH') {
      key = 'pdh'
    } else if (indicatorType === 'PDL') {
      key = 'pdl'
    }

    if (!key || !currentResult.indicators[key]) return null

    const targetTimestamp = timestamp || currentResult.timestamp

    // Find value at target timestamp
    const indicatorArray = currentResult.indicators[key]
    const match = indicatorArray.find((item) => item.timestamp === targetTimestamp)
    return match ? match.value : null
  }

  // Build formula text with interactive tooltips (can display for a specific zone in explore mode)
  const getFormulaTextWithTooltips = (zoneType = null) => {
    // Determine which formula to use
    let targetFormula = formula
    if (zoneType && formulas[zoneType]) {
      targetFormula = formulas[zoneType]
    }

    if (!targetFormula || typeof targetFormula === 'string') {
      return targetFormula || 'Formula not available'
    }

    const { timeframe, indicator1, indicator1Param, operator, indicator2, indicator2Param } =
      targetFormula

    // In explore mode with hover, use hovered price and timestamp
    const timestamp = isExploreMode && hoverData ? hoverData.timestamp : null
    const overridePrice = isExploreMode && hoverData ? hoverData.price : null

    // Format indicator 1
    const indicator1Text = indicator1Param ? `${indicator1}(${indicator1Param})` : indicator1
    const indicator1Value = getIndicatorValue(indicator1, indicator1Param, timestamp, overridePrice)

    // Format indicator 2
    let indicator2Text
    if (indicator2 === 'Value') {
      indicator2Text = indicator2Param
    } else if (indicator2Param) {
      indicator2Text = `${indicator2}(${indicator2Param})`
    } else {
      indicator2Text = indicator2
    }
    const indicator2Value = getIndicatorValue(indicator2, indicator2Param, timestamp)

    return (
      <span>
        {timeframe}{' '}
        <span
          className="indicator-with-tooltip"
          data-tooltip={indicator1Value?.toFixed(2) || 'N/A'}
        >
          {indicator1Text}
        </span>{' '}
        {operator}{' '}
        {indicator2 === 'Value' ? (
          <span>{indicator2Text}</span>
        ) : (
          <span
            className="indicator-with-tooltip"
            data-tooltip={indicator2Value?.toFixed(2) || 'N/A'}
          >
            {indicator2Text}
          </span>
        )}
      </span>
    )
  }

  // Get emoji for bias type
  const getBiasEmoji = (bias) => {
    switch (bias) {
      case 'bullish':
        return '📈'
      case 'bearish':
        return '📉'
      case 'neutral':
        return '➡️'
      default:
        return ''
    }
  }

  const formatBias = (bias) => {
    return bias.charAt(0).toUpperCase() + bias.slice(1)
  }

  const isCorrect = currentResult.accuracy === 1

  // Determine what to display in explore mode
  const exploreContent = () => {
    if (!hoverData || !hoverData.zoneType) {
      // Not hovering - show prompt with same structure to maintain height
      return (
        <>
          <div className="prediction-main">
            <div className="prediction-bias">&nbsp;</div>
            <div className="explore-prompt-text">Hover over chart to explore price zones</div>
          </div>
          <div className="formula-section">
            <div className="formula-text">&nbsp;</div>
          </div>
        </>
      )
    }

    // Hovering - show live bias, price, and formula
    const { price, zoneType } = hoverData
    return (
      <>
        <div className="prediction-main">
          <div className="prediction-bias">
            {formatBias(zoneType)} {getBiasEmoji(zoneType)}
          </div>
          <div className="prediction-price">{price.toFixed(2)}</div>
        </div>

        <div className="formula-section">
          <div className="formula-text">{getFormulaTextWithTooltips(zoneType)}</div>
        </div>
      </>
    )
  }

  return (
    <div className="prediction-overlay">
      {/* Navigation (only in actual mode) */}
      {!isExploreMode && (
        <div className="navigation-header">
          <button
            className="nav-button nav-button-left"
            onClick={onPrevious}
            disabled={currentIndex === 0}
          >
            <span className="nav-arrow-left">►</span>
          </button>
          <span className="navigation-label">
            Prediction {currentIndex + 1} of {totalPredictions}
          </span>
          <button
            className="nav-button nav-button-right"
            onClick={onNext}
            disabled={currentIndex === totalPredictions - 1}
          >
            ►
          </button>
        </div>
      )}

      {/* Mode Toggle - only show for price-based formulas */}
      {!hasTimeBasedFormulas && (
        <div className="mode-toggle-container">
          <span className={`mode-toggle-label ${!isExploreMode ? 'active' : ''}`}>Actual</span>
          <div
            className="mode-toggle-switch"
            onClick={() => setIsExploreMode(!isExploreMode)}
            role="button"
            tabIndex={0}
          >
            <div className={`mode-toggle-slider ${isExploreMode ? 'explore' : 'actual'}`} />
          </div>
          <span className={`mode-toggle-label ${isExploreMode ? 'active' : ''}`}>Explore</span>
        </div>
      )}

      {/* Content based on mode */}
      {isExploreMode && !hasTimeBasedFormulas ? (
        exploreContent()
      ) : (
        <>
          <div className="prediction-main">
            <div className="prediction-bias">
              {formatBias(currentResult.predictedBias)} {getBiasEmoji(currentResult.predictedBias)}
            </div>
            <div className="prediction-price">{currentResult.priceAtPrediction.toFixed(2)}</div>
          </div>

          <div className="formula-section">
            <div className="formula-text">{getFormulaTextWithTooltips()}</div>
          </div>

          <div className="show-next-section">
            <button className="show-next-button" onClick={onToggleNextCandle}>
              {isNextCandleVisible ? '◼ Hide Next' : '▶ Show Next'}
            </button>
            {!isNextCandleVisible && <div className="show-next-hint">reveals result below</div>}
          </div>

          {isNextCandleVisible && (
            <div className="next-candle-results">
              <div className="result-row">
                <div className="result-label">Next Candle:</div>
                <div className="result-value">
                  Close: {currentResult.priceAtValidation?.toFixed(2) || 'N/A'}
                </div>
              </div>
              <div className="result-row">
                <div className="result-label">Direction:</div>
                <div className="result-value">
                  {formatBias(currentResult.actualDirection)}{' '}
                  {getBiasEmoji(currentResult.actualDirection)}
                </div>
              </div>
              <div className={`accuracy-badge ${isCorrect ? 'correct' : 'incorrect'}`}>
                {isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

PredictionOverlay.propTypes = {
  currentIndex: PropTypes.number.isRequired,
  currentResult: PropTypes.shape({
    accuracy: PropTypes.number.isRequired,
    actualDirection: PropTypes.string.isRequired,
    indicators: PropTypes.objectOf(
      PropTypes.arrayOf(
        PropTypes.shape({
          timestamp: PropTypes.number.isRequired,
          value: PropTypes.number.isRequired
        })
      )
    ),
    predictedBias: PropTypes.string.isRequired,
    priceAtPrediction: PropTypes.number.isRequired,
    priceAtValidation: PropTypes.number,
    timestamp: PropTypes.number.isRequired
  }).isRequired,
  formulas: PropTypes.object.isRequired,
  hasTimeBasedFormulas: PropTypes.bool.isRequired,
  hoverData: PropTypes.shape({
    price: PropTypes.number.isRequired,
    timestamp: PropTypes.number.isRequired,
    zoneType: PropTypes.string.isRequired
  }),
  isNextCandleVisible: PropTypes.bool.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onToggleNextCandle: PropTypes.func.isRequired,
  totalPredictions: PropTypes.number.isRequired
}

export default PredictionOverlay
