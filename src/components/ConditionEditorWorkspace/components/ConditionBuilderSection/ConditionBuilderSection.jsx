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
  handleDisplayToggle,
  isMinimized = false
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

  const handleBiasArrowClick = (biasType) => {
    handleCurrentFormulaChange('biasType', biasType)
  }

  const getBiasArrowClass = (biasType) => {
    const isSelected = formulaState.currentFormula.biasType === biasType
    return `bias-option ${isSelected ? 'active' : ''}`
  }

  // Helper to render dropdown options (shared between mini and full)
  const renderDropdownOptions = (placeholder, options, value, onChange, className) => (
    <select className={className} value={value} onChange={onChange}>
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )

  const biasOptions = [
    { value: 'bullish', label: 'Bullish' },
    ...(isNeutralFormulaIncluded ? [{ value: 'neutral', label: 'Neutral' }] : []),
    { value: 'bearish', label: 'Bearish' }
  ]

  const timeframeOptions = [
    { value: '1H', label: '1H' },
    { value: '4H', label: '4H' },
    { value: '1D', label: '1D' }
  ]

  const indicatorOptions = [
    { value: 'SMA(20)', label: 'SMA(20)' },
    { value: 'EMA(20)', label: 'EMA(20)' },
    { value: 'RSI', label: 'RSI' }
  ]

  const operatorOptions = [
    { value: '>', label: 'Greater than' },
    { value: '<', label: 'Less than' },
    { value: '=', label: 'Equals' }
  ]

  const valueOptions = [
    { value: 'SMA(50)', label: 'SMA(50)' },
    { value: 'EMA(50)', label: 'EMA(50)' },
    { value: 'Value', label: 'Custom' }
  ]

  // Render minimized split layout: BIAS arrows + CONDITION dropdowns
  if (isMinimized) {
    return (
      <>
        {/* BIAS Section */}
        <div className="mini-section bias-section">
          <div className="section-header">Bias</div>
          <div className="mini-section-content">
            <div className="bias-arrows">
              <div
                className={getBiasArrowClass('bullish')}
                onClick={() => handleBiasArrowClick('bullish')}
              >
                ↗
              </div>
              {isNeutralFormulaIncluded && (
                <div
                  className={getBiasArrowClass('neutral')}
                  onClick={() => handleBiasArrowClick('neutral')}
                >
                  →
                </div>
              )}
              <div
                className={getBiasArrowClass('bearish')}
                onClick={() => handleBiasArrowClick('bearish')}
              >
                ↘
              </div>
            </div>
          </div>
        </div>

        {/* CONDITION BUILDER Section */}
        <div className="mini-section condition-section">
          <div className="section-header">Condition Builder</div>
          <div className="mini-section-content">
            <div className="formula-builder">
              {renderDropdownOptions(
                'Timeframe',
                timeframeOptions,
                formulaState.currentFormula.timeframe,
                (e) => handleCurrentFormulaChange('timeframe', e.target.value),
                'mini-timeframe-select'
              )}
              {renderDropdownOptions(
                'Indicator',
                indicatorOptions,
                formulaState.currentFormula.indicator1,
                (e) => handleCurrentFormulaChange('indicator1', e.target.value),
                'mini-indicator-select'
              )}
              {renderDropdownOptions(
                'Operation',
                operatorOptions,
                formulaState.currentFormula.operator,
                (e) => handleCurrentFormulaChange('operator', e.target.value),
                'mini-operator-select'
              )}
              {renderDropdownOptions(
                'Value',
                valueOptions,
                formulaState.currentFormula.indicator2,
                (e) => handleCurrentFormulaChange('indicator2', e.target.value),
                'mini-value-select'
              )}
            </div>
            <div className="add-formula-hover">+</div>
          </div>
        </div>
      </>
    )
  }

  // Render full-screen single section layout
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
          {renderDropdownOptions(
            'Select Bias',
            biasOptions,
            formulaState.currentFormula.biasType,
            (e) => handleCurrentFormulaChange('biasType', e.target.value),
            'bias-type-select'
          )}
          {renderDropdownOptions(
            'Timeframe',
            timeframeOptions,
            formulaState.currentFormula.timeframe,
            (e) => handleCurrentFormulaChange('timeframe', e.target.value),
            'timeframe-select'
          )}
          {renderDropdownOptions(
            'Indicator',
            indicatorOptions,
            formulaState.currentFormula.indicator1,
            (e) => handleCurrentFormulaChange('indicator1', e.target.value),
            'indicator-select'
          )}
          {renderDropdownOptions(
            'Operation',
            operatorOptions,
            formulaState.currentFormula.operator,
            (e) => handleCurrentFormulaChange('operator', e.target.value),
            'operator-select'
          )}
          {renderDropdownOptions(
            'Value',
            valueOptions,
            formulaState.currentFormula.indicator2,
            (e) => handleCurrentFormulaChange('indicator2', e.target.value),
            'indicator-select'
          )}
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
  handleDisplayToggle: PropTypes.func.isRequired,
  isMinimized: PropTypes.bool
}

export default ConditionBuilderSection
