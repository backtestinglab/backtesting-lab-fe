import React, { useMemo } from 'react'
import PropTypes from 'prop-types'

import { shouldShowFinishButton, getFinishButtonText } from '../../utils/formulaUtils'
import FormulaBuilder from './components/FormulaBuilder/FormulaBuilder'
import ActionButtons from './components/ActionButtons/ActionButtons'

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
  selectedTimeframes,
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

  // Props mapping for new FormulaBuilder component
  const formulaBuilderProps = useMemo(
    () => ({
      formState: formulaState.currentFormula,
      onChange: handleCurrentFormulaChange,
      layout: isMinimized ? 'vertical' : 'horizontal',
      size: isMinimized ? 'mini' : 'default',
      selectedTimeframes,
      isNeutralFormulaIncluded,
      className: ''
    }),
    [
      formulaState.currentFormula,
      handleCurrentFormulaChange,
      isMinimized,
      selectedTimeframes,
      isNeutralFormulaIncluded
    ]
  )

  // Props mapping for new ActionButtons component
  const actionButtonsProps = useMemo(
    () => ({
      buttons: [
        {
          type: 'finish',
          text: finishButtonState.buttonText,
          onClick: handleFinishFormula,
          show: finishButtonState.showButton,
          disabled: false
        }
      ],
      size: isMinimized ? 'mini' : 'default',
      className: ''
    }),
    [finishButtonState, handleFinishFormula, isMinimized]
  )

  const handleNeutralCheckboxChange = (event) => {
    const isChecked = event.target.checked
    setIsNeutralFormulaIncluded(isChecked)

    if (displayState.displayFormulas.neutral !== isChecked) {
      handleDisplayToggle('neutral')
    }
  }

  // Render minimized split layout: BIAS arrows + CONDITION dropdowns
  if (isMinimized) {
    return (
      <>
        {/* BIAS Section - using bias arrows */}
        <div className="mini-section bias-section">
          <div className="section-header">Bias</div>
          <div className="mini-section-content">
            <div className="bias-arrows">
              {['bullish', 'neutral', 'bearish'].map((bias, index) => {
                if (bias === 'neutral' && !isNeutralFormulaIncluded) {
                  return null
                }

                return (
                  <button
                    key={bias}
                    className={`bias-option ${formulaState.currentFormula.biasType === bias ? 'active' : ''}`}
                    onClick={() => handleCurrentFormulaChange('biasType', bias)}
                    type="button"
                  >
                    {['↗', '→', '↘'][index]}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* CONDITION BUILDER Section - FormulaBuilder without bias (bias is handled by separate section above) */}
        <div className="mini-section condition-section">
          <div className="section-header">Condition Builder</div>
          <div className="mini-section-content">
            <FormulaBuilder
              formState={formulaState.currentFormula}
              onChange={handleCurrentFormulaChange}
              layout="vertical"
              size="mini"
              selectedTimeframes={selectedTimeframes}
              isNeutralFormulaIncluded={isNeutralFormulaIncluded}
            />
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
          <FormulaBuilder {...formulaBuilderProps} />
          <ActionButtons {...actionButtonsProps} />
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
      indicator1Param: PropTypes.number,
      operator: PropTypes.string.isRequired,
      indicator2: PropTypes.string.isRequired,
      indicator2Param: PropTypes.number
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
  selectedTimeframes: PropTypes.arrayOf(PropTypes.string),
  isMinimized: PropTypes.bool
}

export default ConditionBuilderSection
