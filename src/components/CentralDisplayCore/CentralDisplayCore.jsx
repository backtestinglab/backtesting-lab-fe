import React from 'react'
import PropTypes from 'prop-types'
import logo from '../../assets/logo.svg'

import ModelSetupFlow from '../ModelSetupFlow/ModelSetupFlow'

import { useHomeScreen } from '../../contexts/HomeScreenContext'

import './CentralDisplayCore.css'

/**
 * @description Renders the central content of the HUD (logo, welcome text, or setup flow).
 */

const CentralDisplayCore = ({ isLogoVisible, coreDisplay }) => {
  const { setupStep, selectModelType } = useHomeScreen()

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
        <p className="core-greeting">{coreDisplay.greeting}</p>
        <h1 className="core-main-title">{coreDisplay.userNameOrTitle}</h1>
        <div className="description-marquee-container">
          <p className="core-description marquee">{coreDisplay.description}</p>
        </div>
        <div className={`navigation-arrows ${coreDisplay.greeting === 'Hello' ? 'active' : ''}`}>
          <span>◀</span>
          <span>▶</span>
        </div>
      </div>
    )
  }

  return <div className="central-display-core">{renderContent()}</div>

  // return (
  //   <div className="central-display-core">
  //     {isLogoVisible && <img src={logo} alt="BacktestingLab Logo" className="logo" />}
  //     {renderCoreTextContent && (
  //       <div className={`core-text-content ${coreTextContentVisibleClass ? 'visible' : ''}`}>
  //         <p className="core-greeting">{coreDisplay.greeting ? coreDisplay.greeting : <> </>}</p>
  //         <h1 className="core-main-title">{coreDisplay.userNameOrTitle}</h1>
  //         <div className="description-marquee-container">
  //           <p className="core-description marquee">{coreDisplay.description}</p>
  //         </div>
  //         <div
  //           className="navigation-arrows"
  //           style={{
  //             visibility:
  //               coreDisplay.greeting === 'Hello' && coreDisplay.userNameOrTitle === currentUsername
  //                 ? 'visible'
  //                 : 'hidden',
  //             opacity:
  //               coreDisplay.greeting === 'Hello' && coreDisplay.userNameOrTitle === currentUsername
  //                 ? 1
  //                 : 0
  //           }}
  //         >
  //           <span>◀</span>
  //           <span>▶</span>
  //         </div>
  //       </div>
  //     )}
  //   </div>
  // )
}

CentralDisplayCore.propTypes = {
  isLogoVisible: PropTypes.bool.isRequired,
  coreDisplay: PropTypes.shape({
    greeting: PropTypes.string,
    userNameOrTitle: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired
  }).isRequired
}

export default CentralDisplayCore
