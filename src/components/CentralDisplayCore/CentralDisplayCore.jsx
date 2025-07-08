import React from 'react'
import PropTypes from 'prop-types'
import logo from '../../assets/logo.svg'

import ModelSetupFlow from '../ModelSetupFlow/ModelSetupFlow'

import { useHomeScreen } from '../../contexts/HomeScreenContext'

import './CentralDisplayCore.css'

/**
 * @description Renders the central content of the HUD (logo, welcome text, or setup flow).
 */

const CentralDisplayCore = ({ isLogoVisible }) => {
  const { coreDisplay, setupStep, selectModelType } = useHomeScreen()
  const { description, greeting, userNameOrTitle } = coreDisplay

  const renderContent = () => {
    if (isLogoVisible) {
      return <img src={logo} alt="BacktestingLab Logo" className="logo" />
    }

    if (setupStep) {
      return <ModelSetupFlow step={setupStep} onSelectType={selectModelType} />
    }

    // Default case: render welcome text
    return (
      <div className="core-text-content visible">
        <p className="core-greeting">{greeting}</p>
        <h1 className="core-main-title">{userNameOrTitle}</h1>
        <div className="description-marquee-container">
          <p className="core-description marquee">{description}</p>
        </div>
        <div className={`navigation-arrows ${greeting === 'Hello' ? 'active' : ''}`}>
          <span>◀</span>
          <span>▶</span>
        </div>
      </div>
    )
  }

  return <div className="central-display-core">{renderContent()}</div>
}

CentralDisplayCore.propTypes = {
  isLogoVisible: PropTypes.bool.isRequired
}

export default CentralDisplayCore
