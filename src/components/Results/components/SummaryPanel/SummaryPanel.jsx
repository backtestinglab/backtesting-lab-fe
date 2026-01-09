import React from 'react'
import PropTypes from 'prop-types'

import AccuracyCard from './components/AccuracyCard'
import StatCard from './components/StatCard'

import './components/AccuracyCard.css'
import './SummaryPanel.css'

/**
 * SummaryPanel displays 4 stat cards with metrics from bias model scan results.
 * Only rendered in fullscreen mode.
 */
const SummaryPanel = ({ metrics }) => {
  const hasMetrics = metrics !== null && metrics !== undefined

  return (
    <div className="summary-panel">
      <StatCard className="accuracy-card" title="Accuracy">
        <AccuracyCard
          accuracyPercentage={metrics?.accuracyPercentage}
          totalPredictions={metrics?.totalPredictions}
        />
      </StatCard>

      <StatCard className="by-bias-card" title="By Bias">
        <div className="stat-card-placeholder">
          {hasMetrics ? <span>3 bias types</span> : <span className="no-data">No data</span>}
        </div>
      </StatCard>

      <StatCard className="streaks-card" title="Streaks">
        <div className="stat-card-placeholder">
          {hasMetrics ? <span>Win/Lose</span> : <span className="no-data">No data</span>}
        </div>
      </StatCard>

      <StatCard className="price-impact-card" title="Price Impact">
        <div className="stat-card-placeholder">
          {hasMetrics ? <span>Avg change</span> : <span className="no-data">No data</span>}
        </div>
      </StatCard>
    </div>
  )
}

const biasTypeStatShape = PropTypes.shape({
  correct: PropTypes.number,
  percentage: PropTypes.number,
  total: PropTypes.number
})

SummaryPanel.propTypes = {
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
  })
}

SummaryPanel.defaultProps = {
  metrics: null
}

export default SummaryPanel
