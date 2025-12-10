import React from 'react'
import PropTypes from 'prop-types'
import './PredictionOverlay.css'

const PredictionOverlay = ({
  currentIndex,
  currentResult,
  formulas,
  isNextCandleVisible,
  onToggleNextCandle,
  totalPredictions
}) => {
  // Get the formula that matches this prediction
  const formula = formulas[currentResult.predictedBias]

  // Build formula text from formula object
  const getFormulaText = () => {
    if (!formula || typeof formula === 'string') {
      // If formula is a string, return it directly
      return formula || 'Formula not available'
    }

    const { timeframe, indicator1, indicator1Param, operator, indicator2, indicator2Param } = formula

    // Format indicator 1
    const indicator1Text = indicator1Param ? `${indicator1}(${indicator1Param})` : indicator1

    // Format indicator 2
    let indicator2Text
    if (indicator2 === 'Value') {
      indicator2Text = indicator2Param
    } else if (indicator2Param) {
      indicator2Text = `${indicator2}(${indicator2Param})`
    } else {
      indicator2Text = indicator2
    }

    return `${timeframe} ${indicator1Text} ${operator} ${indicator2Text}`
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

  // Format bias text (capitalize first letter)
  const formatBias = (bias) => {
    return bias.charAt(0).toUpperCase() + bias.slice(1)
  }

  // Determine if prediction was correct
  const isCorrect = currentResult.accuracy === 1

  return (
    <div className="prediction-overlay">
      <div className="overlay-header">
        PREDICTION {currentIndex + 1} of {totalPredictions}
      </div>

      <div className="prediction-main">
        <div className="prediction-bias">
          {formatBias(currentResult.predictedBias)} {getBiasEmoji(currentResult.predictedBias)}
        </div>
        <div className="prediction-label">(prediction)</div>
      </div>

      <div className="formula-section">
        <div className="formula-label">{formatBias(currentResult.predictedBias)} formula:</div>
        <div className="formula-text" title="Hover over indicators to see values">
          {getFormulaText()}
        </div>
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
              {formatBias(currentResult.actualDirection)} {getBiasEmoji(currentResult.actualDirection)}
            </div>
          </div>
          <div className={`accuracy-badge ${isCorrect ? 'correct' : 'incorrect'}`}>
            {isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
          </div>
        </div>
      )}
    </div>
  )
}

PredictionOverlay.propTypes = {
  currentIndex: PropTypes.number.isRequired,
  currentResult: PropTypes.shape({
    accuracy: PropTypes.number.isRequired,
    actualDirection: PropTypes.string.isRequired,
    indicators: PropTypes.object,
    predictedBias: PropTypes.string.isRequired,
    priceAtValidation: PropTypes.number
  }).isRequired,
  formulas: PropTypes.object.isRequired,
  isNextCandleVisible: PropTypes.bool.isRequired,
  onToggleNextCandle: PropTypes.func.isRequired,
  totalPredictions: PropTypes.number.isRequired
}

export default PredictionOverlay
