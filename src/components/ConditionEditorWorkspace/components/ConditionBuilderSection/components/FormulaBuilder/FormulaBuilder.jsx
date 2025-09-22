import React from 'react'
import PropTypes from 'prop-types'

import Dropdown from '../../../../../common/Dropdown/Dropdown'
import IndicatorGroup from './components/IndicatorGroup'

import {
  OPERATOR_OPTIONS,
  normalizeTimeframeOptions,
  normalizeBiasOptions
} from '../../../../../../config/formOptions'

import './FormulaBuilder.css'

const FormulaBuilder = ({
  formState,
  onChange,
  layout = 'horizontal',
  size = 'default',
  biasMode = 'dropdown',
  selectedTimeframes = [],
  isNeutralFormulaIncluded = false,
  className = ''
}) => {
  const biasOptions = normalizeBiasOptions().filter(
    (option) => option.value !== 'neutral' || isNeutralFormulaIncluded
  )
  const timeframeOptions = normalizeTimeframeOptions(selectedTimeframes)

  const formulaBuilderClasses = ['formula-builder', layout, className].filter(Boolean).join(' ')

  return (
    <div className={formulaBuilderClasses}>
      {/* Integrated bias selector logic */}
      {biasMode === 'arrows' ? (
        <div className="bias-arrows">
          {['bullish', 'neutral', 'bearish'].map((bias, index) => {
            if (bias === 'neutral' && !isNeutralFormulaIncluded) {
              return null
            }

            return (
              <button
                key={bias}
                className={`bias-option ${formState.biasType === bias ? 'active' : ''}`}
                onClick={() => onChange('biasType', bias)}
                type="button"
              >
                {['↗', '→', '↘'][index]}
              </button>
            )
          })}
        </div>
      ) : (
        <Dropdown
          options={biasOptions}
          value={formState.biasType || ''}
          onChange={(e) => onChange('biasType', e.target.value)}
          variant="accent"
          size={size}
          placeholder="Select Bias"
          className="bias-dropdown"
        />
      )}

      {/* Timeframe dropdown */}
      <Dropdown
        options={timeframeOptions}
        value={formState.timeframe || ''}
        onChange={(e) => onChange('timeframe', e.target.value)}
        variant="standard"
        size={size}
        placeholder="Timeframe"
        className="timeframe-dropdown"
      />

      {/* Left indicator group */}
      <IndicatorGroup
        indicatorType={formState.indicator1 || ''}
        indicatorParam={formState.indicator1Param}
        onIndicatorChange={(value) => onChange('indicator1', value)}
        onParamChange={(value) => onChange('indicator1Param', value)}
        size={size}
        placeholder="Indicator"
        className="left-indicator"
      />

      {/* Operator dropdown */}
      <Dropdown
        options={OPERATOR_OPTIONS}
        value={formState.operator || ''}
        onChange={(e) => onChange('operator', e.target.value)}
        variant="standard"
        size={size}
        placeholder="Operation"
        className="operator-dropdown"
      />

      {/* Right indicator/value group */}
      <IndicatorGroup
        indicatorType={formState.indicator2 || ''}
        indicatorParam={formState.indicator2Param}
        onIndicatorChange={(value) => onChange('indicator2', value)}
        onParamChange={(value) => onChange('indicator2Param', value)}
        size={size}
        placeholder="Value"
        className="right-indicator"
        isValueGroup={true}
      />
    </div>
  )
}

FormulaBuilder.propTypes = {
  formState: PropTypes.shape({
    biasType: PropTypes.string,
    timeframe: PropTypes.string,
    indicator1: PropTypes.string,
    indicator1Param: PropTypes.number,
    operator: PropTypes.string,
    indicator2: PropTypes.string,
    indicator2Param: PropTypes.number
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  layout: PropTypes.oneOf(['horizontal', 'vertical']),
  size: PropTypes.oneOf(['mini', 'default', 'large']),
  biasMode: PropTypes.oneOf(['dropdown', 'arrows']),
  selectedTimeframes: PropTypes.arrayOf(PropTypes.string),
  isNeutralFormulaIncluded: PropTypes.bool,
  className: PropTypes.string
}

export default FormulaBuilder
