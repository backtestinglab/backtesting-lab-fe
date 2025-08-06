import React from 'react'
import PropTypes from 'prop-types'

import './LineThicknessPopup.css'

const LineThicknessPopup = ({ options, onSelect, popupRef, popupPosition, popupVisibility }) => (
  <div
    className={`toolbar-popup thickness-popup position-${popupPosition} ${popupVisibility}`}
    ref={popupRef}
  >
    {options.map((width) => (
      <div key={width} className="thickness-option" onClick={() => onSelect(width)}>
        <span className="thickness-label">{width}px</span>
        <div className="thickness-preview" style={{ height: `${width}px` }}></div>
      </div>
    ))}
  </div>
)

LineThicknessPopup.propTypes = {
  options: PropTypes.arrayOf(PropTypes.number).isRequired,
  onSelect: PropTypes.func.isRequired,
  popupRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  popupPosition: PropTypes.string.isRequired,
  popupVisibility: PropTypes.string.isRequired
}

export default LineThicknessPopup
