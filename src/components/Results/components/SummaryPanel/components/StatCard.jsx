import React from 'react'
import PropTypes from 'prop-types'

import './StatCard.css'

/**
 * Base component for stat cards in the SummaryPanel.
 * Provides consistent styling for title and content areas.
 */
const StatCard = ({ children, className, title }) => {
  return (
    <div className={`stat-card ${className || ''}`}>
      <h4 className="stat-card-title">{title}</h4>
      <div className="stat-card-content">{children}</div>
    </div>
  )
}

StatCard.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  title: PropTypes.string.isRequired
}

StatCard.defaultProps = {
  className: ''
}

export default StatCard
