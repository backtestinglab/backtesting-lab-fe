import React from 'react'
import PropTypes from 'prop-types'
import PopupDropdown from './components/PopupDropdown'
import './Dropdown.css'

const Dropdown = ({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select an option',
  variant = 'standard',
  size = 'default',
  disabled = false,
  className = '',
  hoverStyle = 'default',
  testId = '',
  position = 'bottom'
}) => {
  const normalizedOptions = (options || []).map((option) => {
    if (typeof option === 'string' || typeof option === 'number') {
      return { value: option, label: String(option) }
    }
    return {
      value: option.value,
      label: option.label || String(option.value),
      disabled: option.disabled || false,
      metadata: option.metadata || {},
      icon: option.icon || null
    }
  })

  return (
    <PopupDropdown
      options={normalizedOptions}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      variant={variant}
      size={size}
      disabled={disabled}
      className={className}
      hoverStyle={hoverStyle}
      testId={testId}
      position={position}
    />
  )
}

Dropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        label: PropTypes.string,
        disabled: PropTypes.bool,
        metadata: PropTypes.object,
        icon: PropTypes.string
      })
    ])
  ).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  variant: PropTypes.oneOf(['standard', 'accent']),
  size: PropTypes.oneOf(['mini', 'default', 'large']),
  disabled: PropTypes.bool,
  className: PropTypes.string,
  hoverStyle: PropTypes.oneOf(['default', 'custom']),
  testId: PropTypes.string,
  position: PropTypes.oneOf(['top', 'bottom'])
}

export default Dropdown
