import React from 'react'
import PropTypes from 'prop-types'

import './FontSizePopup.css'

const FontSizePopup = ({ options, onSelect, popupRef, popupPosition, popupVisibility }) => {
  return (
    <div
      className={`toolbar-popup font-size-popup position-${popupPosition} ${popupVisibility}`}
      ref={popupRef}
    >
      <div className="font-size-options-container">
        {options.map((size) => (
          <button key={size} className="font-size-option" onClick={() => onSelect(size)}>
            {size}
          </button>
        ))}
      </div>
    </div>
  )
}

FontSizePopup.propTypes = {
  options: PropTypes.arrayOf(PropTypes.number).isRequired,
  onSelect: PropTypes.func.isRequired,
  popupRef: PropTypes.object,
  popupPosition: PropTypes.string,
  popupVisibility: PropTypes.string
}

export default FontSizePopup
