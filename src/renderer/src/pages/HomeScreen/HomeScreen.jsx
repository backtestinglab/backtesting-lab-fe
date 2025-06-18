import React, { useEffect, useState } from 'react'

import CentralHudDisplay from '../../components/CentralHudDisplay/CentralHudDisplay'
import HudLayoutContainer from '../../components/HudLayoutContainer/HudLayoutContainer'
import OuterFrame from '../../components/OuterFrame/OuterFrame'

import AnalysisOutlineIcon from '../../assets/icons/AnalysisOutlineIcon'
import AnalysisSolidIcon from '../../assets/icons/AnalysisSolidIcon'
import DevelopOutlineIcon from '../../assets/icons/DevelopOutlineIcon'
import DevelopSolidIcon from '../../assets/icons/DevelopSolidIcon'
import FineTuneOutlineIcon from '../../assets/icons/FineTuneOutlineIcon'
import FineTuneSolidIcon from '../../assets/icons/FineTuneSolidIcon'
import RefineSolidIcon from '../../assets/icons/RefineSolidIcon'
import RefineOutlineIcon from '../../assets/icons/RefineOutlineIcon'

import './HomeScreen.css'

const segmentData = {
  develop: {
    title: 'Develop',
    description:
      'Lay the foundation for a new trading or bias model. Test initial concepts and gather baseline data.',
    IconOutline: DevelopOutlineIcon,
    IconSolid: DevelopSolidIcon
  },
  refine: {
    title: 'Refine',
    description:
      'Iterate and add conditions to enhance your model. Focus on improving model quality.',
    IconOutline: RefineOutlineIcon,
    IconSolid: RefineSolidIcon
  },
  'fine-tune': {
    title: 'Fine-Tune',
    description: 'Optimize parameters like Stop Loss, Take Profit, and precise entry points',
    IconOutline: FineTuneOutlineIcon,
    IconSolid: FineTuneSolidIcon
  },
  analyze: {
    title: 'Analyze',
    description:
      'Review comprehensive performance metrics and finalize your strategy for live trading.',
    IconOutline: AnalysisOutlineIcon,
    IconSolid: AnalysisSolidIcon
  }
}

const defaultCoreText = {
  greeting: 'Hello',
  userNameOrTitle: 'User',
  description: 'What are we doing today? Select an option to begin your session.'
}

/**
 * @function HomeScreen
 * @description The main landing screen of the application.
 * @returns {JSX.Element}
 */

const HomeScreen = () => {
  const [coreTextContentVisibleClass, setCoreTextContentVisibleClass] = React.useState(false)
  const [renderCoreTextContent, setRenderCoreTextContent] = React.useState(false)
  const [coreDisplay, setCoreDisplay] = useState(defaultCoreText)
  const [isLogoVisible, setIsLogoVisible] = useState(true)

  const currentUsername = 'David'

  useEffect(() => {
    const logoAnimationTime = 3400

    const logoTimer = setTimeout(() => {
      setIsLogoVisible(false)
      setCoreDisplay((prev) => ({ ...prev, greeting: 'Hello', userNameOrTitle: currentUsername }))
      setRenderCoreTextContent(true)
      requestAnimationFrame(() => setCoreTextContentVisibleClass(true))
    }, logoAnimationTime)

    return () => clearTimeout(logoTimer)
  }, [currentUsername])

  const handleMainNavLinkHover = (segmentKey) => {
    if (!isLogoVisible) {
      const { title, description } = segmentData[segmentKey]
      setCoreDisplay({ greeting: ' ', userNameOrTitle: title, description })
    }
  }

  const handleMainNavLinkLeave = () => {
    if (!isLogoVisible) {
      setCoreDisplay({ ...defaultCoreText, userNameOrTitle: currentUsername })
    }
  }

  const handleSecondaryNavClick = (buttonText) => {
    console.log(`${buttonText} clicked`)
  }

  return (
    <div className="home-screen">
      <div className="side-panel left-panel">
        <div className="panel-section-group">
          <h3 className="panel-main-section-title">Recent</h3>
          <div className="panel-content-sticky-note">
            <ul className="panel-content-list">
              <li>Trading Model Alpha (05/23)</li>
              <li>Bias Study - SPX (05/22)</li>
              <li>Another Recent Item (05/21)</li>
            </ul>
          </div>
        </div>
        <div className="panel-section-group">
          <h3 className="panel-main-section-title">Favourites</h3>
          <div className="panel-content-sticky-note">
            <ul className="panel-content-list">
              <li>Gold Standard Model</li>
              <li>Key Insight Study Omega</li>
            </ul>
          </div>
        </div>
        <div className="panel-section-group">
          <h3 className="panel-main-section-title">Quick Stats</h3>
          <div className="panel-content-sticky-note">
            <div className="panel-content-text">
              <p>
                <span>Best P/F:</span> 3.1 (NQ Scalper)
              </p>
              <p>
                <span>Win Rate:</span> 68% (Overall)
              </p>
              <p>
                <span>Active Models:</span> 5
              </p>
            </div>
          </div>
        </div>
      </div>
      <HudLayoutContainer>
        <OuterFrame
          segmentData={segmentData}
          onMainNavLinkHover={handleMainNavLinkHover}
          onMainNavLinkLeave={handleMainNavLinkLeave}
          onSecondaryNavClick={handleSecondaryNavClick}
        />
        <CentralHudDisplay
          isLogoVisible={isLogoVisible}
          renderCoreTextContent={renderCoreTextContent}
          coreTextContentVisibleClass={coreTextContentVisibleClass}
          coreDisplay={coreDisplay}
          currentUsername={currentUsername}
        />
      </HudLayoutContainer>
      <div className="side-panel right-panel">
        <div className="panel-section-group panel-icon-buttons-header">
          <button className="panel-icon-button user-profile-button">⭐</button>{' '}
          <button className="panel-icon-button settings-button">⚙️</button>{' '}
        </div>
        <div className="panel-section-group">
          <h3 className="panel-main-section-title">Notifications</h3>
          <div className="panel-content-sticky-note notifications-content">
            <ul className="panel-content-list notification-list">
              <li>
                <span>New:</span> Update v1.1 Available!
              </li>
              <li>
                <span>Tip:</span> Try the new &#39;Refine&#39; tool...
              </li>
              <li>
                <span>Done:</span> Backtest &#39;Gamma Squeeze&#39; complete.
              </li>
              <li>
                <span>Alert:</span> Market data connection lost.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomeScreen
