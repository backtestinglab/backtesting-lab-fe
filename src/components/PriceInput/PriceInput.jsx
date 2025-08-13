import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import './PriceInput.css'

const PriceInput = ({ value, onChange, step = 0.01 }) => {
  const [inputValue, setInputValue] = useState(value.toFixed(2))

  useEffect(() => {
    setInputValue(value.toFixed(2))
  }, [value])

  const commitChange = (val) => {
    let numValue = parseFloat(val)
    if (!isNaN(numValue)) {
      const finalValue = parseFloat(numValue.toFixed(2))
      onChange(finalValue)
    } else {
      setInputValue(value.toFixed(2))
    }
  }

  const handleBlur = () => {
    commitChange(inputValue)
  }

  const handleKeyDown = ({ key, target }) => {
    if (key === 'Enter') {
      commitChange(inputValue)
      target.blur()
    } else if (key === 'Escape') {
      setInputValue(value.toFixed(2))
      target.blur()
    }
  }

  const handleStep = (direction) => {
    const newValue = value + direction * step
    const finalValue = parseFloat(newValue.toFixed(2))
    onChange(finalValue)
  }

  return (
    <div className="price-input-container">
      <input
        type="text"
        className="price-input-field"
        value={inputValue}
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
