import React from 'react'
import PropTypes from 'prop-types'
import { isRowVisible } from '../../../../utils/previewUtils'
import './PreviewText.css'

const PreviewText = ({
  rows = [],
  statusMessage = '',
  layout = 'default',
  showFinishButton = false,
  onFinishClick,
  finishButtonText = 'Finish Formula',
  formulaVisibility = {},
  onFormulaVisibilityToggle,
  className = ''
}) => {
  const previewTextClasses = ['preview-text', layout, className].filter(Boolean).join(' ')

  return (
    <div className={previewTextClasses}>
      {rows.length === 0 ? (
        <span className="preview-empty">Build your condition to see preview...</span>
      ) : (
        <div className="preview-rows">
          {rows.map((row, index) => {
            const isVisible = isRowVisible(row, formulaVisibility)

            return (
              <div key={`${row.type}-${index}`} className="preview-row">
                {isVisible && (
                  <div className="preview-content">
                    <span className={`preview-text ${row.completed ? 'completed' : 'incomplete'}`}>
                      {layout === 'compact' ? `${row.text} ${row.emoji}` : row.text}
                    </span>
                    {layout === 'default' && <span className="preview-emoji">{row.emoji}</span>}

                    {/* Finish button for last incomplete row */}
                    {index === rows.length - 1 &&
                      !row.completed &&
                      showFinishButton &&
                      onFinishClick && (
                        <button
                          className={`finish-button ${layout === 'compact' ? 'mini-finish-button' : 'finish-formula-button'}`}
                          onClick={onFinishClick}
                          type="button"
                        >
                          {finishButtonText}
                        </button>
                      )}
                  </div>
                )}

                {/* Formula visibility toggle for completed formulas */}
                {row.completed && onFormulaVisibilityToggle && layout === 'compact' && (
                  <div className="preview-controls">
                    <button
                      className="formula-visibility-toggle"
                      onClick={() => onFormulaVisibilityToggle(row.type)}
                      title={
                        isVisible ? 'Hide this completed formula' : 'Show this completed formula'
                      }
                      type="button"
                    >
                      👁️
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {statusMessage && (
        <div
          className={`status-message ${layout === 'compact' ? 'mini-status-message' : 'status-message'}`}
        >
          {statusMessage}
        </div>
      )}
    </div>
  )
}

PreviewText.propTypes = {
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      emoji: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired
    })
  ),
  statusMessage: PropTypes.string,
  layout: PropTypes.oneOf(['default', 'compact']),
  showFinishButton: PropTypes.bool,
  onFinishClick: PropTypes.func,
  finishButtonText: PropTypes.string,
  formulaVisibility: PropTypes.shape({
    bullish: PropTypes.bool,
    neutral: PropTypes.bool,
    bearish: PropTypes.bool
  }),
  onFormulaVisibilityToggle: PropTypes.func,
  className: PropTypes.string
}

export default PreviewText
