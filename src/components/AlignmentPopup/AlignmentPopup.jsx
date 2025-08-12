import React from 'react'
import PropTypes from 'prop-types'

import './AlignmentPopup.css'

const AlignmentPopup = ({ options, onSelect, popupRef, popupPosition, popupVisibility }) => {
  return (
    <div
      className={`toolbar-popup alignment-popup position-${popupPosition} ${popupVisibility}`}
      ref={popupRef}
    >
      <div className="alignment-options-container">
        {options.map((option) => (
          <button key={option} className="alignment-option" onClick={() => onSelect(option)}>
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>
    </div>
  )
}

AlignmentPopup.propTypes = {
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSelect: PropTypes.func.isRequired,
  popupRef: PropTypes.object,
  popupPosition: PropTypes.string,
  popupVisibility: PropTypes.string
}

export default AlignmentPopup
