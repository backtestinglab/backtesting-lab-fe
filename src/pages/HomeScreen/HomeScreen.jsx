import React, { useEffect, useState, useContext } from 'react'
import PropTypes from 'prop-types'

import CentralHudDisplay from '../../components/CentralHudDisplay/CentralHudDisplay'
import HudLayoutContainer from '../../components/HudLayoutContainer/HudLayoutContainer'
import OuterFrame from '../../components/OuterFrame/OuterFrame'
import SidePanelSection from '../../components/SidePanelSection/SidePanelSection'
import SidePanel from '../../components/SidePanel/SidePanel'

import { useHomeScreen } from '../../contexts/HomeScreenContext'
import { AppViewContext } from '../../contexts/AppViewContext'

import './HomeScreen.css'

/**
 * @function HomeScreen
 * @description The main landing screen of the application. Orchestrates layout, context provides logic.
 * @returns {JSX.Element}
 */

const HomeScreen = ({ hasInitialAnimationPlayed, onInitialAnimationComplete }) => {
  const { navigateTo } = useContext(AppViewContext)
  const [isLogoVisible, setIsLogoVisible] = useState(!hasInitialAnimationPlayed)
  const {
    coreDisplay,
    currentUsername,
    defaultCoreText,
    leaveTimeoutIdRef,
    setCoreDisplay,
    setupStep
  } = useHomeScreen()

  const isTransitioning = setupStep === 'transitioning'
  const homeScreenClassName = `
    home-screen 
    ${isTransitioning ? 'transitioning-out' : ''}
  `

  useEffect(() => {
    if (!hasInitialAnimationPlayed) {
      const logoAnimationTime = 3400

      const logoTimer = setTimeout(() => {
        setIsLogoVisible(false)
        onInitialAnimationComplete()
      }, logoAnimationTime)

      return () => clearTimeout(logoTimer)
    } else {
      setIsLogoVisible(false)
    }
  }, [hasInitialAnimationPlayed, onInitialAnimationComplete])

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
    <div className={homeScreenClassName}>
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
        <OuterFrame onSecondaryNavClick={handleSecondaryNavClick} />
        <CentralHudDisplay isLogoVisible={isLogoVisible} />
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
