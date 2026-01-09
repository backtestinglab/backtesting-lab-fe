import React from 'react'
import PropTypes from 'prop-types'

import Icon from '../Icon/Icon'
import SummaryPanel from './components/SummaryPanel/SummaryPanel'

import './Results.css'

/**
 * Results panel component for displaying full scan results.
 * Includes summary statistics and a results table.
 * Supports both compact (normal) and fullscreen layouts.
 */
const Results = ({ isFullScreen, onToggleFullScreen, results }) => {
  const metrics = results?.metrics || null
  const totalPredictions = metrics?.totalPredictions || 0
  const accuracyPercentage = metrics?.accuracyPercentage || 0
  const showInlineStats = !isFullScreen && totalPredictions > 0

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
            <button title="Previous Prediction">▲</button>
            <button title="Next Prediction" className="down-arrow">
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

        {/* ResultsTable will be added in T021.12.7 */}
        <div className="results-table-placeholder">
          <span className="placeholder-label">Results Table</span>
          <span className="placeholder-hint">(Coming in T021.12.7)</span>
        </div>
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
  actualBias: PropTypes.string,
  correct: PropTypes.bool,
  predictedBias: PropTypes.string,
  priceChange: PropTypes.number,
  timestamp: PropTypes.number
})

Results.propTypes = {
  isFullScreen: PropTypes.bool.isRequired,
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
  results: null
}

export default Results
