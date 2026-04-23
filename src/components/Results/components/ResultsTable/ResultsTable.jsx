import React from 'react'
import PropTypes from 'prop-types'

import { calculateDrawdown } from '../../utils/drawdownCalculator'

import './ResultsTable.css'

const ResultsTable = ({ chartData, isCompact, onRowClick, predictions, selectedIndex }) => {
  /**
   * Formats a Unix timestamp to a human-readable date/time string
   * @param {number} timestamp - Unix timestamp in seconds
   * @returns {string} Formatted date/time (e.g., "Jan 15 10:00 AM")
   */
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000)
    const options = {
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      month: 'short'
    }
    return date.toLocaleString('en-US', options)
  }

  /**
   * Formats a percentage value with sign and decimals
   * @param {number} value - Decimal percentage value
   * @returns {string} Formatted percentage (e.g., "+1.2%" or "-0.4%")
   */
  const formatPercentage = (value) => {
    if (value === null || value === undefined) return '—'
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(2)}%`
  }

  /**
   * Gets the CSS class for bias type color coding
   * @param {string} biasType - 'bullish', 'bearish', or 'neutral'
   * @returns {string} CSS class name
   */
  const getBiasClassName = (biasType) => {
    switch (biasType) {
      case 'bullish':
        return 'bias-bullish'
      case 'bearish':
        return 'bias-bearish'
      case 'neutral':
        return 'bias-neutral'
      default:
        return ''
    }
  }

  /**
   * Renders the result indicator (✓ or ✗)
   * @param {number} accuracy - 1 for correct, 0 for incorrect
   * @returns {JSX.Element}
   */
  const renderResultIcon = (accuracy) => {
    if (accuracy === 1) {
      return <span className="result-icon result-correct">✓</span>
    }
    return <span className="result-icon result-incorrect">✗</span>
  }

  /**
   * Calculates price change percentage from prediction to validation
   * @param {Object} prediction
   * @returns {number} Percentage change
   */
  const calculatePriceChange = (prediction) => {
    const priceChange =
      ((prediction.priceAtValidation - prediction.priceAtPrediction) /
        prediction.priceAtPrediction) *
      100
    return priceChange
  }

  if (!predictions || predictions.length === 0) {
    return (
      <div className="results-table-empty">
        <p>No predictions to display</p>
      </div>
    )
  }

  return (
    <div className="results-table-container">
      <table className="results-table">
        <thead>
          <tr>
            <th className="col-number">#</th>
            <th className="col-datetime">Date/Time</th>
            <th className="col-predicted">Predicted</th>
            <th className="col-actual">Actual</th>
            <th className="col-result">Result</th>
            {!isCompact && (
              <>
                <th className="col-price-change">Price Chg</th>
                <th className="col-drawdown">Drawdown</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {predictions.map((prediction, index) => {
            const isSelected = index === selectedIndex
            const drawdown = calculateDrawdown(prediction, chartData)
            const priceChange = calculatePriceChange(prediction)

            return (
              <tr
                className={isSelected ? 'selected' : ''}
                key={`${prediction.timestamp}-${index}`}
                onClick={() => onRowClick(prediction, index)}
              >
                <td className="col-number">{index + 1}</td>
                <td className="col-datetime">{formatTimestamp(prediction.timestamp)}</td>
                <td className={`col-predicted ${getBiasClassName(prediction.predictedBias)}`}>
                  {prediction.predictedBias.charAt(0).toUpperCase() +
                    prediction.predictedBias.slice(1)}
                </td>
                <td className={`col-actual ${getBiasClassName(prediction.actualDirection)}`}>
                  {prediction.actualDirection.charAt(0).toUpperCase() +
                    prediction.actualDirection.slice(1)}
                </td>
                <td className="col-result">{renderResultIcon(prediction.accuracy)}</td>
                {!isCompact && (
                  <>
                    <td className="col-price-change">{formatPercentage(priceChange)}</td>
                    <td className="col-drawdown">{formatPercentage(drawdown)}</td>
                  </>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

ResultsTable.propTypes = {
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
  isCompact: PropTypes.bool,
  onRowClick: PropTypes.func,
  predictions: PropTypes.arrayOf(
    PropTypes.shape({
      accuracy: PropTypes.number.isRequired,
      actualDirection: PropTypes.string.isRequired,
      predictedBias: PropTypes.string.isRequired,
      priceAtPrediction: PropTypes.number.isRequired,
      priceAtValidation: PropTypes.number.isRequired,
      timestamp: PropTypes.number.isRequired
    })
  ),
  selectedIndex: PropTypes.number
}

ResultsTable.defaultProps = {
  isCompact: false,
  onRowClick: () => {},
  predictions: [],
  selectedIndex: null
}

export default ResultsTable
