import React from 'react'
import PropTypes from 'prop-types'

const DropdownOption = ({
  option,
  isSelected,
  isFocused,
  onClick,
  hoverStyle,
  size
}) => {
  const handleClick = () => {
    if (!option.disabled) {
      onClick()
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }

  // Build CSS classes
  const optionClasses = [
    'dropdown-option',
    `size-${size}`,
    `hover-${hoverStyle}`,
    isSelected ? 'selected' : '',
    isFocused ? 'focused' : '',
    option.disabled ? 'disabled' : ''
  ].filter(Boolean).join(' ')

  return (
    <div
      className={optionClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="option"
      aria-selected={isSelected}
      aria-disabled={option.disabled}
      tabIndex={isFocused ? 0 : -1}
    >
      {option.icon && (
        <span className="dropdown-option-icon">{option.icon}</span>
      )}
      <span className="dropdown-option-label">{option.label}</span>
      {isSelected && (
        <span className="dropdown-option-checkmark">✓</span>
      )}
    </div>
  )
}

DropdownOption.propTypes = {
  option: PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    label: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    metadata: PropTypes.object,
    icon: PropTypes.string
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  isFocused: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  hoverStyle: PropTypes.oneOf(['default', 'custom']).isRequired,
  size: PropTypes.oneOf(['mini', 'default', 'large']).isRequired
}

export default DropdownOption