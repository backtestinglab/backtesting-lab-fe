import React, { useState } from 'react'

import HomeScreen from './pages/HomeScreen/HomeScreen'
import Settings from './pages/Settings/Settings'

import { AppViewContext } from './contexts/AppViewContext'

import './styles/global.css'

const App = () => {
  const [currentView, setCurrentView] = useState('home')
  const [hasInitialAnimationPlayed, setHasInitialAnimationPlayed] = useState(false)

  const navigateTo = (view) => {
    setCurrentView(view)
  }

  const handleInitialAnimationComplete = () => {
    setHasInitialAnimationPlayed(true)
  }

  let viewToRender
  if (currentView === 'home') {
    viewToRender = (
      <HomeScreen
        hasInitialAnimationPlayed={hasInitialAnimationPlayed}
        onInitialAnimationComplete={handleInitialAnimationComplete}
      />
    )
  } else if (currentView === 'settings') {
    viewToRender = <Settings />
  }

  return (
    <AppViewContext.Provider value={{ navigateTo }}>
      <div className="app-container">{viewToRender}</div>
    </AppViewContext.Provider>
  )
}

export default App
