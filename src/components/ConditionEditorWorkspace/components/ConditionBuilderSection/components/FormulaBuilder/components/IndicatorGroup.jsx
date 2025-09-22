import React from 'react'
import PropTypes from 'prop-types'
import Dropdown from '../../../../../../common/Dropdown/Dropdown'
import { INDICATOR_TYPE_OPTIONS } from '../../../../../../../config/formOptions'
import './IndicatorGroup.css'

const IndicatorGroup = ({
  indicatorType,
  indicatorParam,
  onIndicatorChange,
  onParamChange,
  size = 'default',
  placeholder = 'Indicator',
  className = '',
  isValueGroup = false
}) => {
  const indicatorOptions = isValueGroup
    ? [
        ...INDICATOR_TYPE_OPTIONS,
        {
          value: 'Value',
          label: 'Custom',
          metadata: {
            configurable: false
          }
        }
      ]
    : INDICATOR_TYPE_OPTIONS

  const selectedIndicator = indicatorOptions.find((option) => option.value === indicatorType)
  const isConfigurable = selectedIndicator?.metadata?.configurable || false

  const validateParameter = (value) => {
    if (!selectedIndicator?.metadata || !isConfigurable) return true

    const num = parseInt(value)
    if (isNaN(num)) return false

    const { minValue, maxValue } = selectedIndicator.metadata
    return num >= minValue && num <= maxValue
  }

  const handleParameterChange = (event) => {
    const value = event.target.value === '' ? null : parseInt(event.target.value)
    onParamChange(value)
  }

  const handleParameterBlur = (event) => {
    if (event.target.value === '' && selectedIndicator?.metadata?.defaultValue) {
      onParamChange(selectedIndicator.metadata.defaultValue)
    }
  }

  const groupClasses = ['indicator-group', className].filter(Boolean).join(' ')

  const hasValue = indicatorParam !== null && indicatorParam !== undefined && indicatorParam !== ''
  const isValid = hasValue ? validateParameter(indicatorParam) : true
  const inputClasses = [
    'param-input',
    size === 'mini' ? 'mini-param-input' : 'param-input',
    !isValid ? 'invalid' : ''
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={groupClasses}>
      <Dropdown
        options={indicatorOptions}
        value={indicatorType || ''}
        onChange={(e) => onIndicatorChange(e.target.value)}
        variant="standard"
        size={size}
        placeholder={placeholder}
        className="indicator-dropdown"
      />

      {isConfigurable && (
        <input
          type="number"
          className={inputClasses}
          value={indicatorParam !== null && indicatorParam !== undefined ? indicatorParam : ''}
          min={selectedIndicator.metadata.minValue}
          max={selectedIndicator.metadata.maxValue}
          placeholder={selectedIndicator.metadata.defaultValue}
          title={`${selectedIndicator.metadata.paramLabel}: ${selectedIndicator.metadata.minValue}-${selectedIndicator.metadata.maxValue}`}
          onChange={handleParameterChange}
          onBlur={handleParameterBlur}
        />
      )}
    </div>
  )
}

IndicatorGroup.propTypes = {
  indicatorType: PropTypes.string,
  indicatorParam: PropTypes.number,
  onIndicatorChange: PropTypes.func.isRequired,
  onParamChange: PropTypes.func.isRequired,
  size: PropTypes.oneOf(['mini', 'default', 'large']),
  placeholder: PropTypes.string,
  className: PropTypes.string,
  isValueGroup: PropTypes.bool
}

export default IndicatorGroup
