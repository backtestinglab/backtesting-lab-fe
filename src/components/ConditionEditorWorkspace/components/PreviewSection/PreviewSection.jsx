import React from 'react'
import PropTypes from 'prop-types'

import './PreviewSection.css'

const PreviewSection = ({
  displayState,
  handleDisplayToggle,
  isNeutralFormulaIncluded,
  previewRows,
  statusMessage
}) => {
  return (
    <div className="preview-section">
      <div className="preview-header">
        <h4>Preview</h4>
        <div className="display-bias-controls">
          <span className="display-label">Display Bias Formulas</span>
          <div className="display-checkboxes">
            <label>
              <input
                type="checkbox"
                checked={displayState.displayFormulas.bullish}
                onChange={() => handleDisplayToggle('bullish')}
              />
              Bullish
            </label>
            {isNeutralFormulaIncluded && (
              <label>
                <input
                  type="checkbox"
                  checked={displayState.displayFormulas.neutral}
                  onChange={() => handleDisplayToggle('neutral')}
                />
                Neutral
              </label>
            )}
            <label>
              <input
                type="checkbox"
                checked={displayState.displayFormulas.bearish}
                onChange={() => handleDisplayToggle('bearish')}
              />
              Bearish
            </label>
          </div>
        </div>
      </div>
      <div className="section-content-centered">
        <div className="condition-summary">
          {previewRows.length > 0 ? (
            <div className="preview-rows">
              {previewRows.map((row) => (
                <div
                  key={row.type}
                  className={`preview-row ${row.type} ${row.completed ? 'completed' : 'incomplete'}`}
                >
                  <span className="preview-text">{row.text}</span>
                  <span className="preview-emoji">{row.emoji}</span>
                </div>
              ))}
            </div>
          ) : (
            <span className="empty-preview">Build your condition to see preview...</span>
          )}
        </div>
        <div className="status-message">{statusMessage}</div>
      </div>
      <div className="preview-actions">
        <button className="test-sample-button">▶️ Test Sample</button>
        <button className="run-scan-button" disabled={statusMessage !== 'Ready to test'}>
          🔍 Run Scan
        </button>
      </div>
    </div>
  )
}

PreviewSection.propTypes = {
  displayState: PropTypes.shape({
    displayFormulas: PropTypes.shape({
      bullish: PropTypes.bool.isRequired,
      neutral: PropTypes.bool.isRequired,
      bearish: PropTypes.bool.isRequired
    }).isRequired
  }).isRequired,
  handleDisplayToggle: PropTypes.func.isRequired,
  isNeutralFormulaIncluded: PropTypes.bool.isRequired,
  previewRows: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      emoji: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired
    })
  ).isRequired,
  statusMessage: PropTypes.string.isRequired
}

export default PreviewSection