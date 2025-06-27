import React from 'react'
import './HudLayoutContainer.css'
import PropTypes from 'prop-types'

const HudLayoutContainer = ({ children }) => {
  return <div className="hud-layout-container">{children}</div>
}

HudLayoutContainer.propTypes = {
  children: PropTypes.node.isRequired
}

export default HudLayoutContainer
