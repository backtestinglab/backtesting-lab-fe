import React, { useEffect, useState } from 'react'

import CentralHudDisplay from '../../components/CentralHudDisplay/CentralHudDisplay'
import HudLayoutContainer from '../../components/HudLayoutContainer/HudLayoutContainer'
import OuterFrame from '../../components/OuterFrame/OuterFrame'

import './HomeScreen.css'

const segmentData = {
  develop: {
    title: 'Develop',
    description:
      'Lay the foundation for a new trading or bias model. Test initial concepts and gather baseline data.',
    icon: '🔬'
  },
  refine: {
    title: 'Refine',
    description:
      'Iterate and add conditions to enhance your model. Focus on improving model quality.',
    icon: '🔧'
  },
  'fine-tune': {
    title: 'Fine-Tune',
    description: 'Optimize parameters like Stop Loss, Take Profit, and precise entry points',
    icon: '🎯'
  },
  analyze: {
    title: 'Analyze',
    description:
      'Review comprehensive performance metrics and finalize your strategy for live trading.',
    icon: '📊'
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

  const handleSegmentHover = (segmentKey) => {
    if (!isLogoVisible) {
      const { title, description } = segmentData[segmentKey]
      setCoreDisplay({ greeting: ' ', userNameOrTitle: title, description })
    }
  }

  const handleSegmentLeave = () => {
    if (!isLogoVisible) {
      setCoreDisplay({ ...defaultCoreText, userNameOrTitle: currentUsername })
    }
  }

  const handleSecondaryNavClick = (buttonText) => {
    console.log(`${buttonText} clicked`)
  }

  return (
    <div className="home-screen">
      <HudLayoutContainer>
        <OuterFrame onSecondaryNavClick={handleSecondaryNavClick} />
        <CentralHudDisplay
          isLogoVisible={isLogoVisible}
          renderCoreTextContent={renderCoreTextContent}
          coreTextContentVisibleClass={coreTextContentVisibleClass}
          coreDisplay={coreDisplay}
          currentUsername={currentUsername}
          segmentData={segmentData}
          onMouseEnter={handleSegmentHover}
          onMouseLeave={handleSegmentLeave}
        />
        {/* Placeholder for the "rectangles" or pulsing lights between segments */}
        {/* These could be part of the .central-navigator background or ::before/::after elements */}
      </HudLayoutContainer>
    </div>
  )
}

export default HomeScreen
