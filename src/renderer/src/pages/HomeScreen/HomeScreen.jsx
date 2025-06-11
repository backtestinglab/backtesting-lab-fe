import React, { useEffect, useState } from 'react'
import './HomeScreen.css'
import logo from '../../assets/logo.svg'

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

  return (
    <div className="home-screen">
      <div className="outer-frame-piece top-left-frame">
        <div className="square"></div>
        <div className="invert-circle-container">
          <div className="invert-circle"></div>
        </div>
        <div className="trapezoid"></div>
      </div>
      <div className="outer-frame-piece top-right-frame">
        <div className="square"></div>
        <div className="invert-circle-container">
          <div className="invert-circle"></div>
        </div>
        <div className="trapezoid"></div>
      </div>
      <div className="outer-frame-piece lower-frame bottom-left-frame">
        <div className="square"></div>
        <div className="invert-circle-container">
          <div className="invert-circle"></div>
        </div>
        <div className="trapezoid"></div>
      </div>
      <div className="outer-frame-piece lower-frame bottom-right-frame">
        <div className="square"></div>
        <div className="invert-circle-container">
          <div className="invert-circle"></div>
        </div>
        <div className="trapezoid"></div>
      </div>
      <div className="main-hud-area">
        <div className="central-display-core">
          {isLogoVisible && <img src={logo} alt="BacktestingLab Logo" className="logo" />}
          {renderCoreTextContent && (
            <div className={`core-text-content ${coreTextContentVisibleClass ? 'visible' : ''}`}>
              <p className="core-greeting">
                {coreDisplay.greeting ? coreDisplay.greeting : <> </>}
              </p>
              <h1 className="core-main-title">{coreDisplay.userNameOrTitle}</h1>
              <div className="description-marquee-container">
                <p className="core-description marquee">{coreDisplay.description}</p>
              </div>
              <div
                className="navigation-arrows"
                style={{
                  visibility:
                    coreDisplay.greeting === 'Hello' &&
                    coreDisplay.userNameOrTitle === currentUsername
                      ? 'visible'
                      : 'hidden',
                  opacity:
                    coreDisplay.greeting === 'Hello' &&
                    coreDisplay.userNameOrTitle === currentUsername
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

        <div className="navigation-segments-container">
          {Object.keys(segmentData).map((key) => (
            <div
              key={key}
              className={`nav-segment-button ${key.replace(/\s+/g, '-').toLowerCase()}`}
              onMouseEnter={() => handleSegmentHover(key)}
              onMouseLeave={handleSegmentLeave}
              role="button"
              tabIndex={0}
              // onFocus={() => handleSegmentHover(key)} // For keyboard navigation
              // onBlur={handleSegmentLeave} // For keyboard navigation
            >
              {segmentData[key].icon}
            </div>
          ))}
        </div>

        {/* Placeholder for the "rectangles" or pulsing lights between segments */}
        {/* These could be part of the .central-navigator background or ::before/::after elements */}
      </div>

      <div className="secondary-navigation-container">
        <button className="nav-button">Explore Trading Models</button>
        <button className="nav-button">Studies/Research</button>
      </div>
    </div>
  )
}

export default HomeScreen
