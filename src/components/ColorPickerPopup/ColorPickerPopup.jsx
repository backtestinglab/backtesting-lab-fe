import React, { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'

import { parseColor } from '../../utils/colorUtils'

import './ColorPickerPopup.css'

const ColorPickerPopup = ({
  initialColor,
  onColorChange,
  onColorSelect,
  popupPosition,
  popupRef,
  popupVisibility
}) => {
  // Memoize the parsed color to avoid re-parsing on every render.
  // It will only re-run when initialColor changes.
  const parsedColor = useMemo(() => {
    return parseColor(initialColor) || parseColor('#9E9E9E')
  }, [initialColor])

  const [selectedRgb, setSelectedRgb] = useState(parsedColor)
  const [opacity, setOpacity] = useState(Math.round(parsedColor.a * 100))

  useEffect(() => {
    if (parsedColor) {
      const { r, g, b, a } = parsedColor
      setSelectedRgb({ r, g, b })
      setOpacity(Math.round(a * 100))
    }
  }, [parsedColor])

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
      if (onColorSelect) onColorSelect()
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
      selectedRgb &&
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
  onColorSelect: PropTypes.func,
  popupPosition: PropTypes.string.isRequired,
  popupRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  popupVisibility: PropTypes.string.isRequired
}

export default ColorPickerPopup
