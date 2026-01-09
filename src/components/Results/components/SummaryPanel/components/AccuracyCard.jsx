import React from 'react'
import PropTypes from 'prop-types'

/**
 * AccuracyCard displays overall prediction accuracy with a circular gauge visualization.
 * Shows percentage, visual arc, dot indicators, and total count.
 */
const AccuracyCard = ({ accuracyPercentage, totalPredictions }) => {
  const hasData = typeof accuracyPercentage === 'number' && totalPredictions > 0

  if (!hasData) {
    return (
      <div className="accuracy-card-content">
        <span className="no-data">No data</span>
      </div>
    )
  }

  // Calculate arc path for circular gauge
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (accuracyPercentage / 100) * circumference

  // Generate dot indicators (9 dots representing accuracy visually)
  const totalDots = 9
  const filledDots = Math.round((accuracyPercentage / 100) * totalDots)

  return (
    <div className="accuracy-card-content">
      {/* Circular gauge */}
      <div className="accuracy-gauge">
        <svg className="accuracy-gauge-svg" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            className="accuracy-gauge-background"
            cx="60"
            cy="60"
            fill="none"
            r={radius}
            strokeWidth="8"
          />

          {/* Filled arc */}
          <circle
            className="accuracy-gauge-fill"
            cx="60"
            cy="60"
            fill="none"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            strokeWidth="8"
          />
        </svg>

        <div className="accuracy-gauge-text">
          <span className="accuracy-percentage">{accuracyPercentage.toFixed(1)}%</span>
        </div>
      </div>

      <div className="accuracy-dots">
        {Array.from({ length: totalDots }).map((_, index) => (
          <span className={`accuracy-dot ${index < filledDots ? 'filled' : 'empty'}`} key={index} />
        ))}
      </div>

      <div className="accuracy-total">{totalPredictions} total</div>
    </div>
  )
}

AccuracyCard.propTypes = {
  accuracyPercentage: PropTypes.number,
  totalPredictions: PropTypes.number
}

AccuracyCard.defaultProps = {
  accuracyPercentage: null,
  totalPredictions: 0
}

export default AccuracyCard
