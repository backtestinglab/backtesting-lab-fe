import React, { useMemo } from 'react'
import PropTypes from 'prop-types'

import { shouldShowFinishButton, getFinishButtonText } from '../../utils/formulaUtils'
import { isRowVisible } from '../../utils/previewUtils'
import './PreviewSection.css'

const PreviewSection = ({
  displayState,
  handleDisplayToggle,
  isNeutralFormulaIncluded,
  previewRows,
  statusMessage,
  formulaVisibility,
  onFormulaVisibilityToggle,
  isMinimized = false,
  showNorthStar = false,
  onToggleNorthStar,
  biasDefinition = '',
  onBiasDefinitionChange,
  formulaState,
  hasFormulaChanges,
  handleFinishFormula
}) => {
  const getMinimizedPreviewData = () => {
    if (previewRows.length === 0) {
      return {
        rows: [],
        isEmpty: true
      }
    }

    return {
      rows: previewRows.map((row) => ({
        text: row.text + ' ' + row.emoji,
        isCompleted: row.completed,
        type: row.type
      })),
      isEmpty: previewRows.length === 0
    }
  }

  const previewData = getMinimizedPreviewData()

  // Finish button state for minimized view
  const finishButtonState = useMemo(() => {
    if (!formulaState || !hasFormulaChanges) return { showButton: false, buttonText: '' }

    const hasChanges = hasFormulaChanges()
    const showButton = shouldShowFinishButton(
      formulaState.currentFormula,
      formulaState.completedFormulas,
      hasChanges
    )
    const buttonText = getFinishButtonText(hasChanges)

    return { showButton, buttonText }
  }, [formulaState, hasFormulaChanges])

  // Render minimized layout - single return with conditional content
  if (isMinimized) {
    return (
      <div className="mini-section mini-preview-section">
        <div className="section-header">
          {showNorthStar ? 'Preview > North Star' : 'Preview'}
          <button
            className={`north-star-toggle ${showNorthStar ? 'active' : ''}`}
            onClick={onToggleNorthStar}
            title="Define your bias in plain English"
          >
            ⭐
          </button>
        </div>
        <div className={`mini-section-content ${showNorthStar ? 'north-star-expanded' : ''}`}>
          {showNorthStar ? (
            <textarea
              className="bias-definition-textarea-mini"
              placeholder="Describe what makes you think the market will move in this direction..."
              value={biasDefinition}
              onChange={onBiasDefinitionChange}
            />
          ) : (
            <>
              <div className="mini-preview-content">
                {previewData.isEmpty ? (
                  <span className="mini-preview-text incomplete">
                    Build your condition to see preview...
                  </span>
                ) : (
                  <div className="mini-preview-rows">
                    {previewData.rows.map((row, index) => {
                      const isVisible = isRowVisible(row, formulaVisibility)
                      return (
                        <div key={`${row.type}-${index}`} className="mini-preview-row">
                          <div className="mini-preview-content">
                            {isVisible && (
                              <span
                                className={`mini-preview-text ${row.isCompleted ? 'completed' : 'incomplete'}`}
                              >
                                {row.text}
                              </span>
                            )}
                            {index === previewData.rows.length - 1 &&
                              !row.isCompleted &&
                              finishButtonState.showButton && (
                                <button
                                  className="mini-finish-button"
                                  onClick={handleFinishFormula}
                                >
                                  {finishButtonState.buttonText}
                                </button>
                              )}
                          </div>
                          <div className="mini-preview-controls">
                            {row.isCompleted && onFormulaVisibilityToggle && (
                              <button
                                className="formula-visibility-toggle"
                                onClick={() => onFormulaVisibilityToggle(row.type)}
                                title={
                                  isVisible
                                    ? 'Hide this completed formula'
                                    : 'Show this completed formula'
                                }
                              >
                                👁️
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              <div className="mini-preview-bottom">
                <div className="mini-preview-actions">
                  <button className="mini-test-button">Test</button>
                  <button className="mini-scan-button" disabled={statusMessage !== 'Ready to test'}>
                    Scan
                  </button>
                </div>
                <div className="mini-status-message">{statusMessage}</div>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  // Render full-screen layout
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
              {previewRows
                .filter((row) => {
                  if (!row.completed) return true
                  return formulaVisibility && formulaVisibility[row.type] !== false
                })
                .map((row) => (
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
  statusMessage: PropTypes.string.isRequired,
  formulaVisibility: PropTypes.shape({
    bullish: PropTypes.bool,
    neutral: PropTypes.bool,
    bearish: PropTypes.bool
  }),
  onFormulaVisibilityToggle: PropTypes.func,
  isMinimized: PropTypes.bool,
  showNorthStar: PropTypes.bool,
  onToggleNorthStar: PropTypes.func,
  biasDefinition: PropTypes.string,
  onBiasDefinitionChange: PropTypes.func,
  formulaState: PropTypes.object,
  hasFormulaChanges: PropTypes.func,
  handleFinishFormula: PropTypes.func
}

export default PreviewSection
