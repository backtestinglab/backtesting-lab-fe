import React, { createContext, useContext, useRef, useState } from 'react'
import PropTypes from 'prop-types'

import AnalysisOutlineIcon from '../assets/icons/AnalysisOutlineIcon'
import AnalysisSolidIcon from '../assets/icons/AnalysisSolidIcon'
import DevelopOutlineIcon from '../assets/icons/DevelopOutlineIcon'
import DevelopSolidIcon from '../assets/icons/DevelopSolidIcon'
import FineTuneOutlineIcon from '../assets/icons/FineTuneOutlineIcon'
import FineTuneSolidIcon from '../assets/icons/FineTuneSolidIcon'
import RefineSolidIcon from '../assets/icons/RefineSolidIcon'
import RefineOutlineIcon from '../assets/icons/RefineOutlineIcon'

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

const HomeScreenContext = createContext()

export const useHomeScreen = () => {
  return useContext(HomeScreenContext)
}

export const HomeScreenProvider = ({ children, currentUsername }) => {
  const [setupStep, setSetupStep] = useState(null)
  const [newModelConfig, setNewModelConfig] = useState({})
  const [activeNavSegmentKey, setActiveNavSegmentKey] = useState(null)
  const [coreDisplay, setCoreDisplay] = useState({
    ...defaultCoreText,
    userNameOrTitle: currentUsername
  })
  const leaveTimeoutIdRef = useRef(null)

  const handleMainNavLinkEnter = (segmentKey) => {
    if (setupStep) return

    if (leaveTimeoutIdRef.current) {
      clearTimeout(leaveTimeoutIdRef.current)
      leaveTimeoutIdRef.current = null
    }
    const { title, description } = segmentData[segmentKey]
    setCoreDisplay({ greeting: ' ', userNameOrTitle: title, description })
  }

  const handleMainNavLinkLeave = () => {
    if (setupStep) return

    if (leaveTimeoutIdRef.current) clearTimeout(leaveTimeoutIdRef.current)
    leaveTimeoutIdRef.current = setTimeout(() => {
      if (leaveTimeoutIdRef.current) {
        setCoreDisplay({ ...defaultCoreText, userNameOrTitle: currentUsername })
      }
      leaveTimeoutIdRef.current = null
    }, 75)
  }

  const startSetupFlow = (segmentKey) => {
    if (segmentKey === 'develop') {
      if (leaveTimeoutIdRef.current) clearTimeout(leaveTimeoutIdRef.current)
      setActiveNavSegmentKey('develop')
      setSetupStep('selectType')
    }
  }

  const cancelSetupFlow = () => {
    console.log('Canceling setup flow...')
    setSetupStep(null)
    setActiveNavSegmentKey(null)
    setNewModelConfig({})
    setCoreDisplay({ ...defaultCoreText, userNameOrTitle: currentUsername })
  }

  const selectModelType = (type) => {
    console.log(`Model type selected: ${type}`)
    setNewModelConfig({ type })
    setSetupStep('selectDataset')
  }

  // We will add more functions here later for selectDataset, selectTimeframe, etc.

  const value = {
    // State
    activeNavSegmentKey,
    coreDisplay,
    currentUsername,
    defaultCoreText,
    newModelConfig,
    leaveTimeoutIdRef,
    segmentData,
    setupStep,

    // Actions
    cancelSetupFlow,
    handleMainNavLinkEnter,
    handleMainNavLinkLeave,
    selectModelType,
    setActiveNavSegmentKey,
    startSetupFlow
  }

  return <HomeScreenContext.Provider value={value}>{children}</HomeScreenContext.Provider>
}

HomeScreenProvider.propTypes = {
  children: PropTypes.node.isRequired,
  currentUsername: PropTypes.string.isRequired
}
