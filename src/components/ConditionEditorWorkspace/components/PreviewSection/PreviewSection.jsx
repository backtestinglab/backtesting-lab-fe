import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'

import { shouldShowFinishButton, getFinishButtonText } from '../../utils/formulaUtils'
import PreviewText from './components/PreviewText/PreviewText'
import ActionButtons from '../ConditionBuilderSection/components/ActionButtons/ActionButtons'
import TestResultsModal from '../TestResultsModal/TestResultsModal'
import './PreviewSection.css'

const PreviewSection = ({
  chartData,
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
  const [testResults, setTestResults] = useState(null)
  const [isTestModalOpen, setIsTestModalOpen] = useState(false)
  const [testError, setTestError] = useState(null)

  // Helper function to convert technical backend errors to user-friendly messages
  const sanitizeErrorMessage = (errorMessage) => {
    if (!errorMessage) return 'An unexpected error occurred. Please try again.'

    // Check for common error patterns
    if (errorMessage.includes('No files found') || errorMessage.includes('parquet')) {
      return 'Error: Data file is missing or corrupted. Please delete and re-upload the dataset, then try again.'
    }

    if (errorMessage.includes('Dataset') && errorMessage.includes('not found')) {
      return 'Dataset not found. Please select a valid dataset and try again.'
    }

    if (errorMessage.includes('timeframe')) {
      return 'Timeframe error. Please check your formula configuration and try again.'
    }

    if (errorMessage.includes('DuckDB') || errorMessage.includes('SQLite')) {
      return 'Database error. Please restart the application and try again.'
    }

    // If no pattern matches, return a generic friendly message
    console.error('Original backend error:', errorMessage)
    return 'An error occurred while testing. Please try again or check your dataset and formulas.'
  }

  const handleTestSample = async () => {
    setTestError(null)

    if (!formulaState?.completedFormulas) {
      setTestError('No formulas available. Please complete at least one formula.')
      return
    }

    setIsTestLoading(true)

    try {
      // Build formulas array from completed formulas
      const formulas = Object.values(formulaState.completedFormulas).filter(Boolean)

      // Get timeframe from first formula (all formulas must use same timeframe)
      const timeframe = formulas[0]?.timeframe

      if (!timeframe) {
        setTestError('Formula missing timeframe. Please check your formula configuration.')
        setIsTestLoading(false)
        return
      }

      // Call backend IPC
      const response = await window.api.biasTestCondition({
        formulas,
        datasetId,
        timeframe
      })

      if (!response) {
        setTestError('No response received from backend. Please try again.')
        return
      }

      if (!response.success) {
        setTestError(sanitizeErrorMessage(response.message))
        return
      }

      if (!response.results || !Array.isArray(response.results)) {
        setTestError('Invalid response: missing results data.')
        return
      }

      if (response.results.length === 0) {
        setTestError(
          'No predictions found. Your formulas may not match any candles in this dataset, or there may not be enough historical data for the indicators.'
        )
        return
      }

      if (!response.metrics || typeof response.metrics !== 'object') {
        setTestError('Invalid response: missing metrics data.')
        return
      }

      setTestResults(response)
      setIsTestModalOpen(true)
    } catch (error) {
      console.error('Test sample error:', error)
      setTestError(`Error: ${error.message || 'An unexpected error occurred. Please try again.'}`)
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
      <>
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
                  <div
                    className={`mini-status-message ${testError ? 'error' : ''}`}
                    title={testError || undefined}
                  >
                    {testError || statusMessage}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <TestResultsModal
          chartData={chartData || []}
          isOpen={isTestModalOpen}
          onClose={() => setIsTestModalOpen(false)}
          testResults={testResults}
          formulas={formulaState?.completedFormulas || {}}
        />
      </>
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

      {testError && (
        <div className="preview-error">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{testError}</span>
          <button className="error-dismiss" onClick={() => setTestError(null)}>
            ×
          </button>
        </div>
      )}

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

      <TestResultsModal
        chartData={chartData || []}
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        testResults={testResults}
        formulas={formulaState?.completedFormulas || {}}
      />
    </div>
  )
}

PreviewSection.propTypes = {
  chartData: PropTypes.arrayOf(
    PropTypes.shape({
      close: PropTypes.number.isRequired,
      high: PropTypes.number.isRequired,
      low: PropTypes.number.isRequired,
      open: PropTypes.number.isRequired,
      time: PropTypes.number.isRequired,
      volume: PropTypes.number.isRequired
    })
  ),
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
