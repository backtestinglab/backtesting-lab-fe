import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import './PriceInput.css'

const PriceInput = ({ value, onChange, step = 0.01 }) => {
  const [inputValue, setInputValue] = useState(value.toString())

  useEffect(() => {
    setInputValue(value.toString())
  }, [value])

  const handleBlur = () => {
    const numValue = parseFloat(inputValue)
    if (!isNaN(numValue)) {
      onChange(numValue)
    } else {
      setInputValue(value.toString())
    }
  }

  const handleKeyDown = ({ key, target }) => {
    if (key === 'Enter') {
      handleBlur()
      target.blur()
    } else if (key === 'Escape') {
      setInputValue(value.toString())
      target.blur()
    }
  }

  const handleStep = (direction) => {
    const currentValue = parseFloat(inputValue)
    if (isNaN(currentValue)) return
    const newValue = currentValue + direction * step
    const finalValue = parseFloat(newValue.toFixed(2))
    setInputValue(finalValue.toString())
    onChange(finalValue)
  }

  return (
    <div className="price-input-container">
      <input
        type="text"
        className="price-input-field"
        value={parseFloat(inputValue).toFixed(2).toString()}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
      <div className="price-input-stepper">
        <button className="stepper-button up" onClick={() => handleStep(1)}>
          <span className="chevron up"></span>
        </button>
        <button className="stepper-button down" onClick={() => handleStep(-1)}>
          <span className="chevron down"></span>
        </button>
      </div>
    </div>
  )
}

PriceInput.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  step: PropTypes.number
}

export default PriceInput
