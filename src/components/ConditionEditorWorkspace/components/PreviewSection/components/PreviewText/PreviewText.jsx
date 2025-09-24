import React from 'react'
import PropTypes from 'prop-types'
import { isRowVisible } from '../../../../utils/previewUtils'
import ActionButtons from '../../../ConditionBuilderSection/components/ActionButtons/ActionButtons'
import './PreviewText.css'

const PreviewText = ({
  rows = [],
  statusMessage = '',
  layout = 'default',
  formulaVisibility = {},
  onFormulaVisibilityToggle,
  className = '',
  // Finish button props - only used for compact layout
  showFinishButton = false,
  onFinishClick,
  finishButtonText = 'Finish Formula'
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
              <div
                key={`${row.type}-${index}`}
                className={`preview-row ${layout === 'compact' ? 'mini-preview-row' : ''}`}
              >
                <div
                  className={`preview-content ${layout === 'compact' ? 'mini-preview-content' : ''}`}
                >
                  {isVisible && (
                    <>
                      <span
                        className={`${layout === 'compact' ? 'mini-preview-text' : 'preview-text'} ${row.completed ? 'completed' : 'incomplete'}`}
                      >
                        {layout === 'compact' ? `${row.text} ${row.emoji}` : row.text}
                      </span>
                      {layout === 'default' && <span className="preview-emoji">{row.emoji}</span>}

                      {/* Finish button for compact layout - appears inline with last incomplete row */}
                      {layout === 'compact' &&
                        index === rows.length - 1 &&
                        !row.completed &&
                        showFinishButton &&
                        onFinishClick && (
                          <ActionButtons
                            buttons={[
                              {
                                type: 'finish',
                                text: finishButtonText,
                                onClick: onFinishClick,
                                show: true
                              }
                            ]}
                            size="mini"
                          />
                        )}
                    </>
                  )}
                </div>

                {/* Formula visibility toggle for completed formulas */}
                {row.completed && onFormulaVisibilityToggle && layout === 'compact' && (
                  <div className="mini-preview-controls">
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
  formulaVisibility: PropTypes.shape({
    bullish: PropTypes.bool,
    neutral: PropTypes.bool,
    bearish: PropTypes.bool
  }),
  onFormulaVisibilityToggle: PropTypes.func,
  className: PropTypes.string,
  // Finish button props - only used for compact layout
  showFinishButton: PropTypes.bool,
  onFinishClick: PropTypes.func,
  finishButtonText: PropTypes.string
}

export default PreviewText
