import React from 'react'
import PropTypes from 'prop-types'

/**
 * PriceImpactCard displays average price change for correct vs incorrect predictions.
 * Shows two sub-sections with colored left borders and checkmark/X icons.
 */
const PriceImpactCard = ({ correctAvg, incorrectAvg }) => {
  const hasData =
    typeof correctAvg === 'number' &&
    !isNaN(correctAvg) &&
    typeof incorrectAvg === 'number' &&
    !isNaN(incorrectAvg)

  if (!hasData) {
    return (
      <div className="price-impact-card-content">
        <span className="no-data">No data</span>
      </div>
    )
  }

  const formatPercentage = (value) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  return (
    <div className="price-impact-card-content">
      {/* Gains Section */}
      <div className="price-impact-section gains">
        <div className="price-impact-value">{formatPercentage(correctAvg)}</div>
        <div className="price-impact-label">
          <span className="price-impact-label-line">Avg</span>
          <span className="price-impact-label-line">prediction</span>
          <span className="price-impact-label-line">gain</span>
        </div>
      </div>

      {/* Losses Section */}
      <div className="price-impact-section losses">
        <div className="price-impact-value">{formatPercentage(incorrectAvg)}</div>
        <div className="price-impact-label">
          <span className="price-impact-label-line">Avg</span>
          <span className="price-impact-label-line">prediction</span>
          <span className="price-impact-label-line">loss</span>
        </div>
      </div>
    </div>
  )
}

PriceImpactCard.propTypes = {
  correctAvg: PropTypes.number,
  incorrectAvg: PropTypes.number
}

PriceImpactCard.defaultProps = {
  correctAvg: null,
  incorrectAvg: null
}

export default PriceImpactCard
