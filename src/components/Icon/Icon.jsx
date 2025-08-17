import React from 'react'
import PropTypes from 'prop-types'

import './Icon.css'

const ICONS = {
  save: (
    <path d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
  ),
  reset: (
    <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z" />
  ),
  delete: <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
}

const Icon = ({ icon, onClick, disabled = false, title = '' }) => {
  const handleClick = (event) => {
    if (disabled) {
      event.stopPropagation()
      return
    }
    if (onClick) {
      onClick(event)
    }
  }

  return (
    <button className="icon-button" onClick={handleClick} disabled={disabled} title={title}>
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        {ICONS[icon]}
      </svg>
    </button>
  )
}

Icon.propTypes = {
  icon: PropTypes.oneOf(Object.keys(ICONS)).isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  title: PropTypes.string
}

export default Icon
