import React from 'react'
import PropTypes from 'prop-types'

/**
 * BiasByTypeCard displays accuracy breakdown by bias type (bullish/neutral/bearish).
 * Shows horizontal progress bars with percentages and counts for each type.
 */
const BiasByTypeCard = ({ byBiasType }) => {
  const hasData = byBiasType?.bullish || byBiasType?.neutral || byBiasType?.bearish

  if (!hasData) {
    return (
      <div className="bias-by-type-card-content">
        <span className="no-data">No data</span>
      </div>
    )
  }

  const biasTypes = [
    {
      color: 'bullish',
      key: 'bullish',
      label: 'Bullish',
      stats: byBiasType.bullish
    },
    ...(byBiasType.neutral
      ? [
          {
            color: 'neutral',
            key: 'neutral',
            label: 'Neutral',
            stats: byBiasType.neutral
          }
        ]
      : []),
    {
      color: 'bearish',
      key: 'bearish',
      label: 'Bearish',
      stats: byBiasType.bearish
    }
  ]

  return (
    <div className="bias-by-type-card-content">
      {biasTypes.map(({ color, key, label, stats }) => {
        const percentage = stats?.percentage || 0
        const correct = stats?.correct || 0
        const total = stats?.total || 0

        return (
          <div className="bias-type-row" key={key}>
            <div className="bias-type-header">
              <span className="bias-type-label">{label}</span>
              <span className="bias-type-count">
                ({correct} of {total})
              </span>
            </div>
            <div className="bias-type-bar-container">
              <div className={`bias-type-bar-background ${color}`}>
                <div
                  className={`bias-type-bar-fill ${color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="bias-type-percentage">{percentage.toFixed(0)}%</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

BiasByTypeCard.propTypes = {
  byBiasType: PropTypes.shape({
    bearish: PropTypes.shape({
      correct: PropTypes.number,
      percentage: PropTypes.number,
      total: PropTypes.number
    }),
    bullish: PropTypes.shape({
      correct: PropTypes.number,
      percentage: PropTypes.number,
      total: PropTypes.number
    }),
    neutral: PropTypes.shape({
      correct: PropTypes.number,
      percentage: PropTypes.number,
      total: PropTypes.number
    })
  })
}

BiasByTypeCard.defaultProps = {
  byBiasType: null
}

export default BiasByTypeCard
