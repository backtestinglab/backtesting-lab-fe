import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import './ColorPickerPopup.css'

/**
 * @function parseColor
 * @description Parses a hex or rgba color string into an {r, g, b, a} object.
 * @param {string} colorString - The color string (e.g., "#FF5252" or "rgba(255, 82, 82, 0.5)").
 * @returns {{r: number, g: number, b: number, a: number} | null}
 */
const parseColor = (colorString) => {
  // Handle RGBA strings
  const rgbaMatch = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1], 10),
      g: parseInt(rgbaMatch[2], 10),
      b: parseInt(rgbaMatch[3], 10),
      a: rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1
    }
  }

  // Handle HEX strings
  const hexMatch = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(colorString)
  if (hexMatch) {
    return {
      r: parseInt(hexMatch[1], 16),
      g: parseInt(hexMatch[2], 16),
      b: parseInt(hexMatch[3], 16),
      a: 1
    }
  }

  return null
}

const ColorPickerPopup = ({
  initialColor,
  onColorChange,
  popupPosition,
  popupRef,
  popupVisibility
}) => {
  const { r, g, b, a } = parseColor(initialColor)
  const [selectedRgb, setSelectedRgb] = useState({ r, g, b })
  const [opacity, setOpacity] = useState(Math.round(a * 100))

  useEffect(() => {
    if (r && g && b && a) {
      setSelectedRgb({ r, g, b })
      setOpacity(Math.round(a * 100))
    }
  }, [initialColor])

  const handleOpacityChange = (event) => {
    const newOpacity = parseInt(event.target.value, 10)
    setOpacity(newOpacity)
    onColorChange(`rgba(${selectedRgb.r}, ${selectedRgb.g}, ${selectedRgb.b}, ${newOpacity / 100})`)
  }

  const handleColorSelect = (hexColor) => {
    const rgb = parseColor(hexColor)
    if (rgb) {
      setSelectedRgb(rgb)
      onColorChange(`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity / 100})`)
    }
  }

  const hexToRgba = (hexColor) => {
    const rgb = parseColor(hexColor)
    if (rgb) {
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity / 100})`
    }
  }

  const colorPalette = [
    // Row 1 (Greyscale)
    '#FFFFFF',
    '#E0E0E0',
    '#C8DCFF',
    '#9E9E9E',
    '#757575',
    '#616161',
    '#424242',
    '#212121',
    '#000000',
    // Row 2 (Vibrant)
    '#F44336',
    '#FF9800',
    '#FFEB3B',
    '#4CAF50',
    '#00BCD4',
    '#2196F3',
    '#673AB7',
    '#E91E63',
    '#F50057',
    // Row 3 (Light)
    '#FFCDD2',
    '#FFE0B2',
    '#FFF9C4',
    '#C8E6C9',
    '#B2EBF2',
    '#BBDEFB',
    '#D1C4E9',
    '#F8BBD0',
    '#FF80AB',
    // Row 4 (Lighter)
    '#EF9A9A',
    '#FFCC80',
    '#FFF59D',
    '#A5D6A7',
    '#80DEEA',
    '#90CAF9',
    '#B39DDB',
    '#F48FB1',
    '#FF4081',
    // Row 5 (Medium)
    '#E57373',
    '#FFB74D',
    '#FFF176',
    '#81C784',
    '#4DD0E1',
    '#64B5F6',
    '#9575CD',
    '#F06292',
    '#F59057', // replace
    // Row 6 (Dark)
    '#D32F2F',
    '#F57C00',
    '#FBC02D',
    '#388E3C',
    '#0097A7',
    '#1976D2',
    '#512DA8',
    '#C2185B',
    '#C51162',
    // Row 7 (Darker)
    '#B71C1C',
    '#E65100',
    '#F57F17',
    '#1B5E20',
    '#006064',
    '#0D47A1',
    '#311B92',
    '#4A148C',
    '#880E4F'
  ]

  const isColorSelected = (hexColor) => {
    const swatchRgb = parseColor(hexColor)
    return (
      swatchRgb &&
      swatchRgb.r === selectedRgb.r &&
      swatchRgb.g === selectedRgb.g &&
      swatchRgb.b === selectedRgb.b
    )
  }

  return (
    <div
      className={`toolbar-popup color-picker-popup position-${popupPosition} ${popupVisibility}`}
      ref={popupRef}
    >
      <div className="color-grid">
        {colorPalette.map((color) => (
          <div
            key={color}
            className="color-swatch"
            style={{ backgroundColor: color }}
            onClick={() => handleColorSelect(color)}
          >
            {isColorSelected(color) && '✔'}
          </div>
        ))}
      </div>
      <div className="opacity-control">
        <span className="opacity-label">Opacity</span>
        <input
          type="range"
          min="0"
          max="100"
          value={opacity}
          className="opacity-slider"
          onChange={handleOpacityChange}
        />
        <span className="opacity-value">{opacity}%</span>
      </div>
    </div>
  )
}

ColorPickerPopup.propTypes = {
  initialColor: PropTypes.string.isRequired,
  onColorChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  popupPosition: PropTypes.string.isRequired,
  popupRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  popupVisibility: PropTypes.string.isRequired
}

export default ColorPickerPopup
