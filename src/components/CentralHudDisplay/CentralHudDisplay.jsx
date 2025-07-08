import React from 'react'

import CentralDisplayCore from '../CentralDisplayCore/CentralDisplayCore'

import './CentralHudDisplay.css'

/**
 * @description Wrapper for the central part of the HUD, containing the display core.
 */

const CentralHUDDisplay = ({ isLogoVisible, coreDisplay }) => {
  return (
    <div className="main-hud-area">
      <CentralDisplayCore isLogoVisible={isLogoVisible} coreDisplay={coreDisplay} />
    </div>
  )
}

CentralHUDDisplay.propTypes = {
  ...CentralDisplayCore.propTypes
}

export default CentralHUDDisplay
