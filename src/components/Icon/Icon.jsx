import React from 'react'
import PropTypes from 'prop-types'

import iconMap from './iconMap'

import './Icon.css'

const Icon = ({ className = '', icon }) => {
  const IconComponent = iconMap[icon]

  if (!IconComponent) {
    console.error(`Icon not found: ${icon}`)
    return null
  }

  return <IconComponent className={`icon-svg ${className}`} />
}

Icon.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.oneOf(Object.keys(iconMap)).isRequired
}

export default Icon
