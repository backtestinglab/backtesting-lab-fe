import React from 'react'
import PropTypes from 'prop-types'

import './LineStylePopup.css'

const formatStyleName = (style) => {
  if (!style) return ''
  return style.charAt(0).toUpperCase() + style.slice(1)
}

const LineStylePopup = ({ options, onSelect, popupRef, popupPosition, popupVisibility }) => (
  <div
    className={`toolbar-popup line-style-popup position-${popupPosition} ${popupVisibility}`}
    ref={popupRef}
  >
    {options.map((style) => (
      <div key={style} className="line-style-option" onClick={() => onSelect(style)}>
        <div className={`line-style-preview ${style}`}></div>
        <span className="line-style-label">{formatStyleName(style)} Line</span>
      </div>
    ))}
  </div>
)

LineStylePopup.propTypes = {
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSelect: PropTypes.func.isRequired,
  popupRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  popupPosition: PropTypes.string.isRequired,
  popupVisibility: PropTypes.string.isRequired
}

export default LineStylePopup
