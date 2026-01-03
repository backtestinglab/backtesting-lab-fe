import React from 'react'
import PropTypes from 'prop-types'

import Icon from '../Icon/Icon'

import './Results.css'

/**
 * Results panel component for displaying full scan results.
 * Includes summary statistics and a results table.
 * Supports both compact (normal) and fullscreen layouts.
 */
const Results = ({ isFullScreen, onToggleFullScreen }) => {
  return (
    <div className={`results ${isFullScreen ? 'full-screen' : 'compact'}`}>
      <div className="panel-header">
        <h3>Occurrences (0)</h3>
        <div className="panel-header-controls">
          <div className="results-controls">
            <button title="Previous Occurrence">
              ▲
            </button>
            <button title="Next Occurrence" className="down-arrow">
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
        {/* SummaryPanel will be added in T021.12.5 */}
        <div className="results-summary-placeholder">
          <span className="placeholder-label">Summary Panel</span>
          {isFullScreen && <span className="placeholder-hint">(Coming in T021.12.5)</span>}
        </div>

        {/* ResultsTable will be added in T021.12.7 */}
        <div className="results-table-placeholder">
          <span className="placeholder-label">Results Table</span>
          <span className="placeholder-hint">(Coming in T021.12.7)</span>
        </div>
      </div>
    </div>
  )
}

Results.propTypes = {
  isFullScreen: PropTypes.bool.isRequired,
  onToggleFullScreen: PropTypes.func.isRequired
}

export default Results
