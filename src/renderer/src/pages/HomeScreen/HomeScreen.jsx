import React from 'react'
import './HomeScreen.css'
import logo from '../../assets/logo.svg'

const HomeScreen = () => {
  const [showWelcomeText, setShowWelcomeText] = React.useState(false)

  // Simulate logo display then fade to welcome text
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomeText(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="home-screen">
      <div className="central-navigator">
        <div className="navigator-core">
          {!showWelcomeText ? (
            <img src={logo} alt="BacktestingLab Logo" className="logo" />
          ) : (
            <div className="welcome-text">
              <h1>WELCOME USER!</h1>
              <p>What are we doing today?</p>
              <div className="navigation-arrows">
                <span>◀</span>
                <span>▶</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Segments/Arms - Placeholders */}
        <div className="nav-segment develop">Develop</div>
        <div className="nav-segment refine">Refine</div>
        <div className="nav-segment fine-tune">Fine-Tune</div>
        <div className="nav-segment analyze">Analyze & Finish</div>

        {/* Placeholder for the "rectangles" or pulsing lights between segments */}
        {/* These could be part of the .central-navigator background or ::before/::after elements */}
      </div>

      <div className="secondary-navigation">
        <button className="nav-button">Explore Trading Models</button>
        <button className="nav-button">Studies/Research</button>
      </div>
    </div>
  )
}

export default HomeScreen
