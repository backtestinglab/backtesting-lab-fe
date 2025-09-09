import React, { useMemo } from 'react'
import PropTypes from 'prop-types'

import { shouldShowFinishButton, getFinishButtonText } from '../../utils/formulaUtils'

import './ConditionBuilderSection.css'

const ConditionBuilderSection = ({
  formulaState,
  hasFormulaChanges,
  handleCurrentFormulaChange,
  handleFinishFormula,
  isNeutralFormulaIncluded,
  setIsNeutralFormulaIncluded,
  displayState,
  handleDisplayToggle
}) => {
  const finishButtonState = useMemo(() => {
    const hasChanges = hasFormulaChanges()
    const showButton = shouldShowFinishButton(
      formulaState.currentFormula,
      formulaState.completedFormulas,
      hasChanges
    )
    const buttonText = getFinishButtonText(hasChanges)

    return { showButton, buttonText }
  }, [formulaState, hasFormulaChanges])

  const handleNeutralCheckboxChange = (event) => {
    const isChecked = event.target.checked
    setIsNeutralFormulaIncluded(isChecked)

    if (displayState.displayFormulas.neutral !== isChecked) {
      handleDisplayToggle('neutral')
    }
  }
  return (
    <div className="condition-bias-section">
      <div className="condition-header">
        <h4>Condition & Bias Builder</h4>
        <div className="neutral-checkbox">
          <label>
            <input
              type="checkbox"
              checked={isNeutralFormulaIncluded}
              onChange={handleNeutralCheckboxChange}
            />
            Include neutral bias formula
          </label>
        </div>
      </div>
      <div className="section-content-centered condition-builder-content">
        <div className="formula-row">
          <select
            className="bias-type-select"
            value={formulaState.currentFormula.biasType}
            onChange={(event) => handleCurrentFormulaChange('biasType', event.target.value)}
          >
            <option value="">Select Bias</option>
            <option value="bullish">Bullish</option>
            {isNeutralFormulaIncluded && <option value="neutral">Neutral</option>}
            <option value="bearish">Bearish</option>
          </select>
          <select
            className="timeframe-select"
            value={formulaState.currentFormula.timeframe}
            onChange={(event) => handleCurrentFormulaChange('timeframe', event.target.value)}
          >
            <option value="">Timeframe</option>
            <option value="1H">1H</option>
            <option value="4H">4H</option>
            <option value="1D">1D</option>
          </select>
          <select
            className="indicator-select"
            value={formulaState.currentFormula.indicator1}
            onChange={(event) => handleCurrentFormulaChange('indicator1', event.target.value)}
          >
            <option value="">Indicator</option>
            <option value="SMA(20)">SMA(20)</option>
            <option value="EMA(20)">EMA(20)</option>
            <option value="RSI">RSI</option>
          </select>
          <select
            className="operator-select"
            value={formulaState.currentFormula.operator}
            onChange={(event) => handleCurrentFormulaChange('operator', event.target.value)}
          >
            <option value="">Operation</option>
            <option value=">">Greater then</option>
            <option value="<">Less then</option>
            <option value="=">Equals</option>
          </select>
          <select
            className="indicator-select"
            value={formulaState.currentFormula.indicator2}
            onChange={(event) => handleCurrentFormulaChange('indicator2', event.target.value)}
          >
            <option value="">Value</option>
            <option value="SMA(50)">SMA(50)</option>
            <option value="EMA(50)">EMA(50)</option>
            <option value="Value">Custom</option>
          </select>
          {finishButtonState.showButton && (
            <button className="finish-formula-button" onClick={handleFinishFormula}>
              {finishButtonState.buttonText}
            </button>
          )}
        </div>
      </div>
      <div className="add-variable-section">
        <button className="add-variable-button">Add Variable</button>
      </div>
    </div>
  )
}

ConditionBuilderSection.propTypes = {
  formulaState: PropTypes.shape({
    currentFormula: PropTypes.shape({
      biasType: PropTypes.string.isRequired,
      timeframe: PropTypes.string.isRequired,
      indicator1: PropTypes.string.isRequired,
      operator: PropTypes.string.isRequired,
      indicator2: PropTypes.string.isRequired
    }).isRequired,
    completedFormulas: PropTypes.shape({
      bullish: PropTypes.object,
      neutral: PropTypes.object,
      bearish: PropTypes.object
    }).isRequired
  }).isRequired,
  hasFormulaChanges: PropTypes.func.isRequired,
  handleCurrentFormulaChange: PropTypes.func.isRequired,
  handleFinishFormula: PropTypes.func.isRequired,
  isNeutralFormulaIncluded: PropTypes.bool.isRequired,
  setIsNeutralFormulaIncluded: PropTypes.func.isRequired,
  displayState: PropTypes.shape({
    displayFormulas: PropTypes.shape({
      neutral: PropTypes.bool.isRequired
    }).isRequired
  }).isRequired,
  handleDisplayToggle: PropTypes.func.isRequired
}

export default ConditionBuilderSection
