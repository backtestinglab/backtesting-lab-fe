import React, { useState } from 'react'

import Develop from './pages/Develop/Develop'
import HomeScreen from './pages/HomeScreen/HomeScreen'
import Settings from './pages/Settings/Settings'

import { AppViewContext } from './contexts/AppViewContext'
import { HomeScreenProvider } from './contexts/HomeScreenContext'

import './styles/global.css'

const App = () => {
  const [currentView, setCurrentView] = useState('home')
  const [hasInitialAnimationPlayed, setHasInitialAnimationPlayed] = useState(false)
  const [modelConfigForDevelopPage, setModelConfigForDevelopPage] = useState(null)

  const currentUsername = 'David'

  const navigateTo = (view, payload = null) => {
    if (view === 'develop') {
      setModelConfigForDevelopPage(payload)
    }
    setCurrentView(view)
  }

  const handleInitialAnimationComplete = () => {
    setHasInitialAnimationPlayed(true)
  }

  let viewToRender
  if (currentView === 'home') {
    viewToRender = (
      <HomeScreenProvider currentUsername={currentUsername}>
        <HomeScreen
          hasInitialAnimationPlayed={hasInitialAnimationPlayed}
          onInitialAnimationComplete={handleInitialAnimationComplete}
        />
      </HomeScreenProvider>
    )
  } else if (currentView === 'settings') {
    viewToRender = <Settings />
  } else if (currentView === 'develop') {
    viewToRender = <Develop modelConfig={modelConfigForDevelopPage} />
  }

  return (
    <AppViewContext.Provider value={{ navigateTo }}>
      <div className="app-container">{viewToRender}</div>
    </AppViewContext.Provider>
  )
}

export default App
