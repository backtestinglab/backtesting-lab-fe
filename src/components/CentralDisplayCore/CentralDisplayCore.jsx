import React from 'react'
import PropTypes from 'prop-types'
import logo from '../../assets/logo.svg'

import './CentralDisplayCore.css'

const CentralDisplayCore = ({
  isLogoVisible,
  renderCoreTextContent,
  coreTextContentVisibleClass,
  coreDisplay,
  currentUsername
}) => {
  return (
    <div className="central-display-core">
      {isLogoVisible && <img src={logo} alt="BacktestingLab Logo" className="logo" />}
      {renderCoreTextContent && (
        <div className={`core-text-content ${coreTextContentVisibleClass ? 'visible' : ''}`}>
          <p className="core-greeting">{coreDisplay.greeting ? coreDisplay.greeting : <> </>}</p>
          <h1 className="core-main-title">{coreDisplay.userNameOrTitle}</h1>
          <div className="description-marquee-container">
            <p className="core-description marquee">{coreDisplay.description}</p>
          </div>
          <div
            className="navigation-arrows"
            style={{
              visibility:
                coreDisplay.greeting === 'Hello' && coreDisplay.userNameOrTitle === currentUsername
                  ? 'visible'
                  : 'hidden',
              opacity:
                coreDisplay.greeting === 'Hello' && coreDisplay.userNameOrTitle === currentUsername
                  ? 1
                  : 0
            }}
          >
            <span>◀</span>
            <span>▶</span>
          </div>
        </div>
      )}
    </div>
  )
}

CentralDisplayCore.propTypes = {
  isLogoVisible: PropTypes.bool.isRequired,
  renderCoreTextContent: PropTypes.bool.isRequired,
  coreTextContentVisibleClass: PropTypes.bool.isRequired,
  coreDisplay: PropTypes.shape({
    greeting: PropTypes.string,
    userNameOrTitle: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired
  }).isRequired,
  currentUsername: PropTypes.string.isRequired
}

export default CentralDisplayCore
