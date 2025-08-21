import React from 'react'
import PropTypes from 'prop-types'

import iconMap from './iconMap'

import './Icon.css'

const Icon = React.forwardRef(
  ({ className = '', disabled = false, icon, onClick, title = '' }, ref) => {
    const IconComponent = iconMap[icon]

    if (!IconComponent) {
      console.error(`Icon not found: ${icon}`)
      return null
    }

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
      <button
        ref={ref}
        className={`icon-button ${className}`}
        disabled={disabled}
        onClick={handleClick}
        title={title}
      >
        <IconComponent className="icon-svg" />
      </button>
    )
  }
)

Icon.displayName = 'Icon'

Icon.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  icon: PropTypes.oneOf(Object.keys(iconMap)).isRequired,
  onClick: PropTypes.func,
  title: PropTypes.string
}

export default Icon
