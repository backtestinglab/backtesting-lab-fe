import React from 'react'
import PropTypes from 'prop-types'

import './NorthStarSection.css'

const NorthStarSection = ({ isMinimized, value, onChange }) => {
  const sectionClassName = isMinimized ? 'north-star-section minimized' : 'north-star-section'
  const placeholderText = `Start here. Define your bias model in Plain English. An example of one is shown below.


- I am bullish when the 20-period SMA is above the 50-period SMA on the 1-day timeframe, and the RSI is above 50. 

- I am bearish when the 20-period SMA is below the 50-period SMA on the 1-day timeframe, and the RSI is below 50.

- I remain neutral when the SMAs are within 0.5% of each other.`

  return (
    <div className={sectionClassName}>
      <div className="north-star-header">
        <h4>⭐ Setup Criteria ⭐</h4>
        <p className="north-star-subtitle">Define your bias model below</p>
      </div>
      <div className="north-star-content">
        <textarea
          className="bias-definition-textarea"
          placeholder={placeholderText}
          rows={12}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  )
}

NorthStarSection.propTypes = {
  isMinimized: PropTypes.bool,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}

NorthStarSection.defaultProps = {
  isMinimized: false
}

export default NorthStarSection
