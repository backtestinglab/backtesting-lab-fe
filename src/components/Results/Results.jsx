import React, { useState } from 'react'
import PropTypes from 'prop-types'

import Icon from '../Icon/Icon'
import ResultsTable from './components/ResultsTable/ResultsTable'
import SummaryPanel from './components/SummaryPanel/SummaryPanel'

import './Results.css'

/**
 * Results panel component for displaying full scan results.
 * Includes summary statistics and a results table.
 * Supports both compact (normal) and fullscreen layouts.
 */
const Results = ({
  chartData,
  isFullScreen,
  onNavigateToTimestamp,
  onToggleFullScreen,
  results
}) => {
  const [selectedIndex, setSelectedIndex] = useState(null)

  const metrics = results?.metrics || null
  const predictions = results?.predictions || []
  const totalPredictions = metrics?.totalPredictions || 0
  const accuracyPercentage = metrics?.accuracyPercentage || 0
  const showInlineStats = !isFullScreen && totalPredictions > 0

  /**
   * Handles row click in the results table
   * @param {Object} prediction - The clicked prediction
   * @param {number} index - The index of the clicked prediction
   */
  const handleRowClick = (prediction, index) => {
    setSelectedIndex(index)
    if (onNavigateToTimestamp) {
      onNavigateToTimestamp(prediction.timestamp)
    }
  }

  /**
   * Navigates to the next prediction in the list
   */
  const handleNextPrediction = () => {
    if (predictions.length === 0) return
    const nextIndex = selectedIndex === null ? 0 : (selectedIndex + 1) % predictions.length
    const nextPrediction = predictions[nextIndex]
    setSelectedIndex(nextIndex)
    if (onNavigateToTimestamp && nextPrediction) {
      onNavigateToTimestamp(nextPrediction.timestamp)
    }
  }

  /**
   * Navigates to the previous prediction in the list
   */
  const handlePrevPrediction = () => {
    if (predictions.length === 0) return
    const prevIndex =
      selectedIndex === null
        ? predictions.length - 1
        : (selectedIndex - 1 + predictions.length) % predictions.length
    const prevPrediction = predictions[prevIndex]
    setSelectedIndex(prevIndex)
    if (onNavigateToTimestamp && prevPrediction) {
      onNavigateToTimestamp(prevPrediction.timestamp)
    }
  }

  return (
    <div className={`results ${isFullScreen ? 'full-screen' : 'compact'}`}>
      <div className="panel-header">
        <h3>
          Results
          {showInlineStats && (
            <span className="results-header-stats">
              ({totalPredictions} predictions &bull; {accuracyPercentage.toFixed(1)}% accuracy)
            </span>
          )}
        </h3>
        <div className="panel-header-controls">
          <div className="results-controls">
            <button onClick={handlePrevPrediction} title="Previous Prediction">
              ▲
            </button>
            <button className="down-arrow" onClick={handleNextPrediction} title="Next Prediction">
              ▲
            </button>
          </div>
          <button
            className={`fullscreen-toggle-button-base ${isFullScreen ? 'active' : ''}`}
            onClick={onToggleFullScreen}
            title={isFullScreen ? 'Minimize' : 'Maximize'}
          >
            <Icon icon="fullscreen" />
          </button>
        </div>
      </div>

      <div className="results-content">
        {isFullScreen && <SummaryPanel metrics={metrics} />}

        <ResultsTable
          chartData={chartData}
          isCompact={!isFullScreen}
          onRowClick={handleRowClick}
          predictions={predictions}
          selectedIndex={selectedIndex}
        />
      </div>
    </div>
  )
}

const biasTypeStatShape = PropTypes.shape({
  correct: PropTypes.number,
  percentage: PropTypes.number,
  total: PropTypes.number
})

const predictionShape = PropTypes.shape({
  accuracy: PropTypes.number,
  actualDirection: PropTypes.string,
  predictedBias: PropTypes.string,
  priceAtPrediction: PropTypes.number,
  priceAtValidation: PropTypes.number,
  timestamp: PropTypes.number
})

Results.propTypes = {
  chartData: PropTypes.arrayOf(
    PropTypes.shape({
      close: PropTypes.number.isRequired,
      high: PropTypes.number.isRequired,
      low: PropTypes.number.isRequired,
      open: PropTypes.number.isRequired,
      time: PropTypes.number.isRequired,
      volume: PropTypes.number.isRequired
    })
  ),
  isFullScreen: PropTypes.bool.isRequired,
  onNavigateToTimestamp: PropTypes.func,
  onToggleFullScreen: PropTypes.func.isRequired,
  results: PropTypes.shape({
    metrics: PropTypes.shape({
      accuracyPercentage: PropTypes.number,
      byBiasType: PropTypes.shape({
        bearish: biasTypeStatShape,
        bullish: biasTypeStatShape,
        neutral: biasTypeStatShape
      }),
      priceImpact: PropTypes.shape({
        correctAvg: PropTypes.number,
        incorrectAvg: PropTypes.number
      }),
      streaks: PropTypes.shape({
        bestWinStreak: PropTypes.number,
        worstLoseStreak: PropTypes.number
      }),
      totalPredictions: PropTypes.number
    }),
    modelId: PropTypes.number,
    predictions: PropTypes.arrayOf(predictionShape),
    success: PropTypes.bool
  })
}

Results.defaultProps = {
  chartData: [],
  onNavigateToTimestamp: null,
  results: null
}

export default Results
