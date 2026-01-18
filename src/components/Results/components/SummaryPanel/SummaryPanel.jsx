import React from 'react'
import PropTypes from 'prop-types'

import AccuracyCard from './components/AccuracyCard'
import BiasByTypeCard from './components/BiasByTypeCard'
import PriceImpactCard from './components/PriceImpactCard'
import StatCard from './components/StatCard'
import StreaksCard from './components/StreaksCard'

import './components/AccuracyCard.css'
import './components/BiasByTypeCard.css'
import './components/PriceImpactCard.css'
import './components/StreaksCard.css'
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
        <BiasByTypeCard byBiasType={metrics?.byBiasType} />
      </StatCard>

      <StatCard className="streaks-card" title="Streaks">
        <StreaksCard
          bestWinStreak={metrics?.streaks?.bestWinStreak}
          worstLoseStreak={metrics?.streaks?.worstLoseStreak}
        />
      </StatCard>

      <StatCard className="price-impact-card" title="Price Impact">
        <PriceImpactCard
          correctAvg={metrics?.priceImpact?.correctAvg}
          incorrectAvg={metrics?.priceImpact?.incorrectAvg}
        />
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
