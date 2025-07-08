import React, { useEffect, useState, useRef, useContext } from 'react'
import PropTypes from 'prop-types'

import CentralHudDisplay from '../../components/CentralHudDisplay/CentralHudDisplay'
import HudLayoutContainer from '../../components/HudLayoutContainer/HudLayoutContainer'
import OuterFrame from '../../components/OuterFrame/OuterFrame'
import SidePanelSection from '../../components/SidePanelSection/SidePanelSection'
import SidePanel from '../../components/SidePanel/SidePanel'

import { useHomeScreen } from '../../contexts/HomeScreenContext'
import { AppViewContext } from '../../contexts/AppViewContext'

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

const HomeScreen = ({ hasInitialAnimationPlayed, onInitialAnimationComplete }) => {
  const { navigateTo } = useContext(AppViewContext)
  const [coreDisplay, setCoreDisplay] = useState(defaultCoreText)
  const [isLogoVisible, setIsLogoVisible] = useState(!hasInitialAnimationPlayed)
  const leaveTimeoutIdRef = useRef(null)

  const { setupStep } = useHomeScreen()
  const currentUsername = 'David'

  useEffect(() => {
    if (!hasInitialAnimationPlayed) {
      const logoAnimationTime = 3400

      const logoTimer = setTimeout(() => {
        setIsLogoVisible(false)
        setCoreDisplay((prev) => ({ ...prev, greeting: 'Hello', userNameOrTitle: currentUsername }))
        onInitialAnimationComplete()
      }, logoAnimationTime)

      return () => clearTimeout(logoTimer)
    } else {
      setIsLogoVisible(false)
      setCoreDisplay((prev) => ({ ...prev, greeting: 'Hello', userNameOrTitle: currentUsername }))
    }
  }, [currentUsername, hasInitialAnimationPlayed, onInitialAnimationComplete])

  const handleMainNavLinkEnter = (segmentKey) => {
    if (setupStep) return
    if (!isLogoVisible) {
      if (leaveTimeoutIdRef.current) {
        clearTimeout(leaveTimeoutIdRef.current)
        leaveTimeoutIdRef.current = null
      }
      const { title, description } = segmentData[segmentKey]
      setCoreDisplay({ greeting: ' ', userNameOrTitle: title, description })
    }
  }

  const handleMainNavLinkLeave = () => {
    if (setupStep) return
    if (!isLogoVisible) {
      if (leaveTimeoutIdRef.current) clearTimeout(leaveTimeoutIdRef.current)
      leaveTimeoutIdRef.current = setTimeout(() => {
        if (leaveTimeoutIdRef.current) {
          setCoreDisplay({ ...defaultCoreText, userNameOrTitle: currentUsername })
        }
        leaveTimeoutIdRef.current = null
      }, 75)
    }
  }

  useEffect(() => {
    const handleWindowBlur = () => {
      if (!isLogoVisible) {
        if (leaveTimeoutIdRef.current) {
          clearTimeout(leaveTimeoutIdRef.current)
          leaveTimeoutIdRef.current = null
        }
        if (coreDisplay.greeting === ' ') {
          setCoreDisplay({ ...defaultCoreText, userNameOrTitle: currentUsername })
        }
      }
    }

    window.addEventListener('blur', handleWindowBlur)
    return () => {
      window.removeEventListener('blur', handleWindowBlur)
      if (leaveTimeoutIdRef.current) clearTimeout(leaveTimeoutIdRef.current)
    }
  }, [isLogoVisible, currentUsername, coreDisplay.greeting])

  const handleSecondaryNavClick = (buttonText) => {
    console.log(`${buttonText} clicked`)
  }

  const handleSettingsClick = () => {
    navigateTo('settings')
  }

  return (
    <div className="home-screen">
      <SidePanel position="left">
        <SidePanelSection title="Recent" className="recent-section">
          <ul className="panel-content-list">
            <li tabIndex={0} className="panel-list-item">
              Trading Model Alpha (05/23)
            </li>
            <li tabIndex={0} className="panel-list-item">
              Bias Study - SPX (05/22)
            </li>
            <li tabIndex={0} className="panel-list-item">
              Another Recent Item (05/21)
            </li>
          </ul>
        </SidePanelSection>
        <SidePanelSection title="Favourites" className="favourites-section">
          <ul className="panel-content-list">
            <li tabIndex={0} className="panel-list-item">
              Gold Standard Model
            </li>
            <li tabIndex={0} className="panel-list-item">
              Key Insight Study Omega
            </li>
          </ul>
        </SidePanelSection>
        <SidePanelSection title="Quick Stats" className="quick-stats-section">
          <div className="panel-content-text">
            <p>
              <span>Best P/F:</span> 3.1 (NQ Scalper)
            </p>
            <p>
              <span>Win Rate:</span> 68% (Overall)
            </p>
            <p>
              <span>Total Backtests:</span> 408
            </p>
          </div>
        </SidePanelSection>
      </SidePanel>
      <HudLayoutContainer>
        <OuterFrame
          segmentData={segmentData}
          onMainNavLinkEnter={handleMainNavLinkEnter}
          onMainNavLinkLeave={handleMainNavLinkLeave}
          onSecondaryNavClick={handleSecondaryNavClick}
        />
        <CentralHudDisplay coreDisplay={coreDisplay} isLogoVisible={isLogoVisible} />
      </HudLayoutContainer>
      <SidePanel position="right">
        <div className="panel-section-group panel-icon-buttons-header">
          <button className="panel-icon-button user-profile-button">⭐</button>{' '}
          <button className="panel-icon-button settings-button" onClick={handleSettingsClick}>
            ⚙️
          </button>{' '}
        </div>
        <SidePanelSection title="Notifications" className="notifications-section">
          <ul className="panel-content-list notification-list">
            <li tabIndex={0} className="panel-list-item">
              <span>New:</span> Update v1.1 Available!
            </li>
            <li tabIndex={0} className="panel-list-item">
              <span>Tip:</span> Try the new &#39;Refine&#39; tool...
            </li>
            <li tabIndex={0} className="panel-list-item">
              <span>Done:</span> Backtest &#39;Gamma Squeeze&#39; complete.
            </li>
            <li tabIndex={0} className="panel-list-item">
              <span>Alert:</span> Market data connection lost.
            </li>
          </ul>
        </SidePanelSection>
      </SidePanel>
    </div>
  )
}

HomeScreen.propTypes = {
  hasInitialAnimationPlayed: PropTypes.bool.isRequired,
  onInitialAnimationComplete: PropTypes.func.isRequired
}

export default HomeScreen
