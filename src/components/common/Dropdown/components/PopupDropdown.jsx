import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import DropdownOption from './DropdownOption'

const PopupDropdown = ({
  options,
  value,
  onChange,
  placeholder,
  variant,
  size,
  disabled,
  className,
  hoverStyle,
  testId,
  position
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const dropdownRef = useRef(null)
  const popupRef = useRef(null)
  const triggerRef = useRef(null)

  // Get display text for selected value
  const selectedOption = options.find((option) => option.value === value)
  const displayText = selectedOption ? selectedOption.label : placeholder

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setFocusedIndex(-1)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setFocusedIndex((prev) => {
            const nextIndex = prev < options.length - 1 ? prev + 1 : 0
            return options[nextIndex]?.disabled ? nextIndex + 1 : nextIndex
          })
          break
        case 'ArrowUp':
          event.preventDefault()
          setFocusedIndex((prev) => {
            const nextIndex = prev > 0 ? prev - 1 : options.length - 1
            return options[nextIndex]?.disabled ? nextIndex - 1 : nextIndex
          })
          break
        case 'Enter':
          event.preventDefault()
          if (focusedIndex >= 0 && !options[focusedIndex]?.disabled) {
            handleOptionSelect(options[focusedIndex].value)
          }
          break
        case 'Escape':
          event.preventDefault()
          setIsOpen(false)
          setFocusedIndex(-1)
          triggerRef.current?.focus()
          break
        default:
          break
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, focusedIndex, options])

  const handleToggle = () => {
    if (disabled) return
    setIsOpen(!isOpen)
    setFocusedIndex(-1)
  }

  const handleTriggerKeyDown = (event) => {
    if (disabled) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleToggle()
    }
  }

  const handleOptionSelect = (selectedValue) => {
    onChange({ target: { value: selectedValue } })
    setIsOpen(false)
    setFocusedIndex(-1)
    triggerRef.current?.focus()
  }

  // Build CSS classes
  const dropdownClasses = [
    'dropdown',
    `variant-${size}`,
    `style-${variant}`,
    `position-${position}`,
    isOpen ? 'visible' : '',
    className
  ]
    .filter(Boolean)
    .join(' ')

  const triggerClasses = [
    'dropdown-trigger',
    `variant-${size}`,
    `style-${variant}`,
    disabled ? 'disabled' : '',
    isOpen ? 'open' : ''
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div ref={dropdownRef} className="dropdown-container" data-testid={testId}>
      <button
        ref={triggerRef}
        className={triggerClasses}
        onClick={handleToggle}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={placeholder}
      >
        <span className={`dropdown-text ${!selectedOption ? 'placeholder' : ''}`}>
          {displayText}
        </span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {!disabled && (
        <div ref={popupRef} className={dropdownClasses} role="listbox">
          {options.map((option, index) => (
            <DropdownOption
              key={option.value}
              option={option}
              isSelected={option.value === value}
              isFocused={index === focusedIndex}
              onClick={() => handleOptionSelect(option.value)}
              hoverStyle={hoverStyle}
              size={size}
            />
          ))}
        </div>
      )}
    </div>
  )
}

PopupDropdown.propTypes = {
  options: PropTypes.array.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['standard', 'accent']).isRequired,
  size: PropTypes.oneOf(['mini', 'default', 'large']).isRequired,
  disabled: PropTypes.bool.isRequired,
  className: PropTypes.string.isRequired,
  hoverStyle: PropTypes.oneOf(['default', 'custom']).isRequired,
  testId: PropTypes.string.isRequired,
  position: PropTypes.oneOf(['top', 'bottom']).isRequired
}

export default PopupDropdown
