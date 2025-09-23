import React, { useMemo, useState } from 'react'
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
  // Feature toggles for safe A/B testing of new components
  const [featureToggles, setFeatureToggles] = useState({
    useNewFormulaBuilder: false,
    useNewActionButtons: false
  })

  const toggleFeature = (feature) => {
    setFeatureToggles((prev) => ({ ...prev, [feature]: !prev[feature] }))
  }

  const setAllToggles = (enabled) => {
    setFeatureToggles({
      useNewFormulaBuilder: enabled,
      useNewActionButtons: enabled
    })
  }
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

  const handleBiasArrowClick = (biasType) => {
    handleCurrentFormulaChange('biasType', biasType)
  }

  const getBiasArrowClass = (biasType) => {
    const isSelected = formulaState.currentFormula.biasType === biasType
    return `old-bias-option ${isSelected ? 'active' : ''}`
  }

  const getIndicatorConfig = (indicatorType) => {
    return [...indicatorOptions, ...valueOptions].find((option) => option.type === indicatorType)
  }

  const validateIndicatorParameter = (indicatorType, parameter) => {
    const config = getIndicatorConfig(indicatorType)
    if (!config || !config.configurable) return true

    const num = parseInt(parameter)
    if (isNaN(num)) return false
    return num >= config.minValue && num <= config.maxValue
  }

  const renderDropdownOptions = (placeholder, options, value, onChange, className) => (
    <select className={className} value={value} onChange={onChange}>
      <option value="">{placeholder}</option>
      {options.map(({ label, type, value }) => (
        <option key={value || type} value={value || type}>
          {label}
        </option>
      ))}
    </select>
  )

  // Helper to render parameter input for configurable indicators
  const renderParameterInput = (indicatorType, currentParam, onParamChange, className) => {
    const config = getIndicatorConfig(indicatorType)
    if (!config || !config.configurable) return null

    const handleParameterChange = (event) => {
      const value = event.target.value === '' ? null : parseInt(event.target.value)
      onParamChange(value)
    }

    const handleParameterBlur = (event) => {
      if (event.target.value === '') {
        onParamChange(config.defaultValue)
      }
    }

    const hasValue = currentParam !== null && currentParam !== undefined && currentParam !== ''
    const isValid = hasValue ? validateIndicatorParameter(indicatorType, currentParam) : true
    const inputClassName = `${className} ${isValid ? '' : 'invalid'}`

    return (
      <input
        type="number"
        className={inputClassName}
        value={currentParam !== null ? currentParam : ''}
        min={config.minValue}
        max={config.maxValue}
        placeholder={config.defaultValue}
        title={`${config.paramLabel}: ${config.minValue}-${config.maxValue}`}
        onChange={handleParameterChange}
        onBlur={handleParameterBlur}
      />
    )
  }

  const biasOptions = [
    { value: 'bullish', label: 'Bullish' },
    ...(isNeutralFormulaIncluded ? [{ value: 'neutral', label: 'Neutral' }] : []),
    { value: 'bearish', label: 'Bearish' }
  ]

  const timeframeOptions = selectedTimeframes.map((tf) => ({
    value: tf,
    label: tf
  }))

  const baseIndicators = {
    SMA: {
      type: 'SMA',
      label: 'SMA',
      configurable: true,
      paramLabel: 'Period',
      minValue: 1,
      maxValue: 999
    },
    EMA: {
      type: 'EMA',
      label: 'EMA',
      configurable: true,
      paramLabel: 'Period',
      minValue: 1,
      maxValue: 999
    },
    RSI: {
      type: 'RSI',
      label: 'RSI',
      configurable: true,
      paramLabel: 'Period',
      minValue: 1,
      maxValue: 99
    }
  }

  const indicatorOptions = [
    { ...baseIndicators.SMA, defaultValue: 20 },
    { ...baseIndicators.EMA, defaultValue: 20 },
    { ...baseIndicators.RSI, defaultValue: 14 }
  ]

  const operatorOptions = [
    { value: '>', label: 'Greater than' },
    { value: '<', label: 'Less than' },
    { value: '=', label: 'Equals' }
  ]

  const valueOptions = [
    { ...baseIndicators.SMA, defaultValue: 50 },
    { ...baseIndicators.EMA, defaultValue: 50 },
    {
      type: 'Value',
      label: 'Custom',
      defaultValue: 0,
      configurable: false,
      paramLabel: null,
      minValue: null,
      maxValue: null
    }
  ]

  // Development-only toggle UI for testing new components
  const renderDevToggles = () => {
    if (process.env.NODE_ENV !== 'development') return null

    return (
      <div
        className="dev-testing-panel"
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: '#1a1a1a',
          color: '#fff',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 9999,
          minWidth: '200px'
        }}
      >
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Component Testing</h4>
        <div style={{ display: 'grid', gap: '5px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="checkbox"
              checked={featureToggles.useNewFormulaBuilder && featureToggles.useNewActionButtons}
              onChange={(e) => setAllToggles(e.target.checked)}
            />
            🚀 Use All New Components
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="checkbox"
              checked={featureToggles.useNewFormulaBuilder}
              onChange={() => toggleFeature('useNewFormulaBuilder')}
            />
            FormulaBuilder
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="checkbox"
              checked={featureToggles.useNewActionButtons}
              onChange={() => toggleFeature('useNewActionButtons')}
            />
            ActionButtons
          </label>
        </div>
        <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
          <button
            onClick={() => setAllToggles(false)}
            style={{ fontSize: '10px', padding: '2px 5px' }}
          >
            Reset to Old
          </button>
          <button
            onClick={() => setAllToggles(true)}
            style={{ fontSize: '10px', padding: '2px 5px' }}
          >
            Set to New
          </button>
        </div>
      </div>
    )
  }

  // Render minimized split layout: BIAS arrows + CONDITION dropdowns
  if (isMinimized) {
    return (
      <>
        {renderDevToggles()}

        {featureToggles.useNewFormulaBuilder ? (
          // NEW: Keep original 3-section layout structure, but use bias arrows from FormulaBuilder
          <>
            {/* BIAS Section - using FormulaBuilder's bias arrows only */}
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
                  className="condition-only-builder"
                />
                <div className="add-formula-hover">+</div>
              </div>
            </div>
          </>
        ) : (
          // OLD: Split sections with hardcoded bias arrows and condition dropdowns
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
                <div className="old-formula-builder">
                  {renderDropdownOptions(
                    'Timeframe',
                    timeframeOptions,
                    formulaState.currentFormula.timeframe,
                    (e) => handleCurrentFormulaChange('timeframe', e.target.value),
                    'mini-timeframe-select'
                  )}
                  <div className="mini-indicator-group">
                    {renderDropdownOptions(
                      'Indicator',
                      indicatorOptions,
                      formulaState.currentFormula.indicator1,
                      (e) => handleCurrentFormulaChange('indicator1', e.target.value),
                      'mini-indicator-select'
                    )}
                    {renderParameterInput(
                      formulaState.currentFormula.indicator1,
                      formulaState.currentFormula.indicator1Param,
                      (value) => handleCurrentFormulaChange('indicator1Param', value),
                      'mini-param-input'
                    )}
                  </div>
                  {renderDropdownOptions(
                    'Operation',
                    operatorOptions,
                    formulaState.currentFormula.operator,
                    (e) => handleCurrentFormulaChange('operator', e.target.value),
                    'mini-operator-select'
                  )}
                  <div className="mini-indicator-group">
                    {renderDropdownOptions(
                      'Value',
                      valueOptions,
                      formulaState.currentFormula.indicator2,
                      (e) => handleCurrentFormulaChange('indicator2', e.target.value),
                      'mini-value-select'
                    )}
                    {renderParameterInput(
                      formulaState.currentFormula.indicator2,
                      formulaState.currentFormula.indicator2Param,
                      (value) => handleCurrentFormulaChange('indicator2Param', value),
                      'mini-param-input'
                    )}
                  </div>
                </div>
                <div className="add-formula-hover">+</div>
              </div>
            </div>
          </>
        )}
      </>
    )
  }

  // Render full-screen single section layout
  return (
    <div className="condition-bias-section">
      {renderDevToggles()}

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
        {featureToggles.useNewFormulaBuilder ? (
          // NEW: FormulaBuilder component
          <div className="formula-row">
            <FormulaBuilder {...formulaBuilderProps} />
            {featureToggles.useNewActionButtons ? (
              <ActionButtons {...actionButtonsProps} />
            ) : (
              finishButtonState.showButton && (
                <button className="finish-formula-button" onClick={handleFinishFormula}>
                  {finishButtonState.buttonText}
                </button>
              )
            )}
          </div>
        ) : (
          // OLD: Hardcoded dropdowns and inputs
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
            <div className="indicator-group">
              {renderDropdownOptions(
                'Indicator',
                indicatorOptions,
                formulaState.currentFormula.indicator1,
                (e) => handleCurrentFormulaChange('indicator1', e.target.value),
                'indicator-select'
              )}
              {renderParameterInput(
                formulaState.currentFormula.indicator1,
                formulaState.currentFormula.indicator1Param,
                (value) => handleCurrentFormulaChange('indicator1Param', value),
                'old-param-input'
              )}
            </div>
            {renderDropdownOptions(
              'Operation',
              operatorOptions,
              formulaState.currentFormula.operator,
              (e) => handleCurrentFormulaChange('operator', e.target.value),
              'operator-select'
            )}
            <div className="indicator-group">
              {renderDropdownOptions(
                'Value',
                valueOptions,
                formulaState.currentFormula.indicator2,
                (e) => handleCurrentFormulaChange('indicator2', e.target.value),
                'indicator-select'
              )}
              {renderParameterInput(
                formulaState.currentFormula.indicator2,
                formulaState.currentFormula.indicator2Param,
                (value) => handleCurrentFormulaChange('indicator2Param', value),
                'old-param-input'
              )}
            </div>
            {featureToggles.useNewActionButtons ? (
              <ActionButtons {...actionButtonsProps} />
            ) : (
              finishButtonState.showButton && (
                <button className="finish-formula-button" onClick={handleFinishFormula}>
                  {finishButtonState.buttonText}
                </button>
              )
            )}
          </div>
        )}
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
