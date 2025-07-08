import React, { createContext, useState, useContext } from 'react'
import PropTypes from 'prop-types'

const HomeScreenContext = createContext()

export const useHomeScreen = () => {
  return useContext(HomeScreenContext)
}

export const HomeScreenProvider = ({ children }) => {
  const [setupStep, setSetupStep] = useState(null)
  const [newModelConfig, setNewModelConfig] = useState({})
  const [activeNavSegmentKey, setActiveNavSegmentKey] = useState(null)

  const startSetupFlow = (segmentKey) => {
    if (segmentKey === 'develop') {
      setActiveNavSegmentKey('develop')
      setSetupStep('selectType')
    }
  }

  const cancelSetupFlow = () => {
    setSetupStep(null)
    setActiveNavSegmentKey(null)
    setNewModelConfig({})
  }

  const selectModelType = (type) => {
    setNewModelConfig({ type })
    setSetupStep('selectDataset')
  }

  // We will add more functions here later for selectDataset, selectTimeframe, etc.

  const value = {
    setupStep,
    newModelConfig,
    activeNavSegmentKey,
    setActiveNavSegmentKey,
    startSetupFlow,
    cancelSetupFlow,
    selectModelType
  }

  return <HomeScreenContext.Provider value={value}>{children}</HomeScreenContext.Provider>
}

HomeScreenProvider.propTypes = {
  children: PropTypes.node.isRequired
}
