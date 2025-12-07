import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'

import { shouldShowFinishButton, getFinishButtonText } from '../../utils/formulaUtils'
import PreviewText from './components/PreviewText/PreviewText'
import ActionButtons from '../ConditionBuilderSection/components/ActionButtons/ActionButtons'
import './PreviewSection.css'

const PreviewSection = ({
  datasetId,
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
  // Test sample state
  const [isTestLoading, setIsTestLoading] = useState(false)

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

  const previewData = getMinimizedPreviewData() // CLEAN UP? - Currently unused

  const handleTestSample = async () => {
    // Validate prerequisites
    if (!datasetId) {
      console.warn('Cannot test: No dataset selected')
      return
    }

    if (!formulaState?.completedFormulas) {
      console.warn('Cannot test: No formulas available')
      return
    }

    setIsTestLoading(true)

    try {
      // Build formulas array from completed formulas
      const formulas = Object.values(formulaState.completedFormulas).filter(Boolean)

      if (formulas.length === 0) {
        console.warn('Cannot test: No completed formulas')
        setIsTestLoading(false)
        return
      }

      // Get timeframe from first formula (all formulas must use same timeframe)
      const timeframe = formulas[0]?.timeframe

      if (!timeframe) {
        console.warn('Cannot test: Formula missing timeframe')
        setIsTestLoading(false)
        return
      }

      // Call backend IPC
      const response = await window.api.biasTestCondition({
        formulas,
        datasetId,
        timeframe
      })

      console.log('Test results:', response)

      // TODO: Open TestResultsModal when implemented (T021.10.5)
    } catch (error) {
      console.error('Test sample error:', error)
    } finally {
      setIsTestLoading(false)
    }
  }

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
              <div className="mini-preview-container">
                <PreviewText
                  rows={previewRows}
                  statusMessage=""
                  layout="compact"
                  formulaVisibility={formulaVisibility}
                  onFormulaVisibilityToggle={onFormulaVisibilityToggle}
                  className=""
                  showFinishButton={finishButtonState.showButton}
                  onFinishClick={handleFinishFormula}
                  finishButtonText={finishButtonState.buttonText}
                />
              </div>
              <div className="mini-preview-bottom">
                <ActionButtons
                  buttons={[
                    {
                      type: 'test',
                      text: isTestLoading ? 'Testing...' : 'Test',
                      onClick: handleTestSample,
                      show: true,
                      disabled: statusMessage !== 'Ready to test' || isTestLoading
                    },
                    {
                      type: 'scan',
                      text: 'Scan',
                      onClick: () => {},
                      show: true,
                      disabled: statusMessage !== 'Ready to test'
                    }
                  ]}
                  size="mini"
                  className="mini-preview-actions"
                />
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
          <PreviewText
            rows={previewRows}
            statusMessage={statusMessage}
            layout="default"
            formulaVisibility={formulaVisibility}
            onFormulaVisibilityToggle={onFormulaVisibilityToggle}
            className=""
          />
        </div>
      </div>

      <div className="preview-actions">
        <ActionButtons
          buttons={[
            {
              type: 'test',
              text: isTestLoading ? '⏳ Testing...' : '▶️ Test Sample',
              onClick: handleTestSample,
              show: true,
              disabled: statusMessage !== 'Ready to test' || isTestLoading
            },
            {
              type: 'scan',
              text: '🔍 Run Scan',
              onClick: () => {},
              show: true,
              disabled: statusMessage !== 'Ready to test'
            }
          ]}
          size="default"
          className=""
        />
      </div>
    </div>
  )
}

PreviewSection.propTypes = {
  datasetId: PropTypes.number,
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
