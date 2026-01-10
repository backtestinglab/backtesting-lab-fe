import React, { createContext, useContext, useRef, useState } from 'react'
import PropTypes from 'prop-types'

import { AppViewContext } from './AppViewContext'

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

export const useHomeScreen = () => useContext(HomeScreenContext)

const TIMEFRAME_ORDER_MAP = {
  '1M': 1,
  '5M': 5,
  '15M': 15,
  '1H': 60,
  '4H': 240,
  '1D': 1440,
  '1W': 10080,
  '1Mo': 43200
}

const sortTimeframes = (timeframes) => {
  const sorted = [...timeframes].sort((a, b) => {
    const valueA = TIMEFRAME_ORDER_MAP[a] || 999999
    const valueB = TIMEFRAME_ORDER_MAP[b] || 999999
    return valueA - valueB
  })
  return sorted
}

export const HomeScreenProvider = ({ children, currentUsername }) => {
  const [setupStep, setSetupStep] = useState(null)
  const [newModelConfig, setNewModelConfig] = useState({})
  const [activeNavSegmentKey, setActiveNavSegmentKey] = useState(null)
  const [coreDisplay, setCoreDisplay] = useState({
    ...defaultCoreText,
    userNameOrTitle: currentUsername
  })
  const [datasets, setDatasets] = useState([])
  const { navigateTo } = useContext(AppViewContext)
  const leaveTimeoutIdRef = useRef(null)

  const toCamelCase = (str) => str.replace(/_([a-z])/g, (g) => g[1].toUpperCase())

  const convertKeysToCamelCase = (obj) => {
    if (Array.isArray(obj)) return obj.map((v) => convertKeysToCamelCase(v))
    if (obj !== null && obj.constructor === Object) {
      return Object.keys(obj).reduce(
        (result, key) => ({
          ...result,
          [toCamelCase(key)]: convertKeysToCamelCase(obj[key])
        }),
        {}
      )
    }
    return obj
  }

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
    if (setupStep) return
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

  const fetchAndSetDatasets = async () => {
    const result = await window.api.getAllDatasets()
    if (result.success) {
      const camelCaseData = convertKeysToCamelCase(result.data)
      setDatasets(camelCaseData)
      return camelCaseData
    }
    console.error('Failed to fetch datasets:', result.message)
    return []
  }

  const selectModelType = async (type) => {
    console.log(`Model type selected: ${type}`)
    setNewModelConfig({ type })

    const availableDatasets = await fetchAndSetDatasets()
    // const availableDatasets = [] // for testing purposes

    if (availableDatasets.length > 0) {
      setSetupStep('selectDataset')
    } else {
      setSetupStep('noDatasets')
    }
  }

  const selectDataset = (datasetId) => {
    const selected = datasets.find((data) => data.id === datasetId)
    console.log('Dataset selected:', selected)
    setNewModelConfig((prev) => ({ ...prev, dataset: selected, selectedTimeframes: [] }))
    setSetupStep('selectTimeframe')
  }

  const toggleTimeframe = (timeframe) => {
    setNewModelConfig((prev) => {
      const currentSelection = prev.selectedTimeframes || []
      let newSelection

      if (currentSelection.includes(timeframe)) {
        newSelection = currentSelection.filter((tf) => tf !== timeframe)
      } else {
        if (currentSelection.length < 3) {
          newSelection = [...currentSelection, timeframe]
        } else {
          return prev
        }
      }

      const sortedSelection = sortTimeframes(newSelection)

      return { ...prev, selectedTimeframes: sortedSelection }
    })
  }

  const finalizeSetup = () => {
    console.log('Final Model Config:', newModelConfig)
    setSetupStep('transitioning')
    const transitionDuration = 1300
    setTimeout(() => {
      navigateTo('develop', newModelConfig)
      setSetupStep(null)
      setNewModelConfig({})
    }, transitionDuration)
  }

  const value = {
    // State
    activeNavSegmentKey,
    coreDisplay,
    currentUsername,
    datasets,
    defaultCoreText,
    newModelConfig,
    leaveTimeoutIdRef,
    segmentData,
    setupStep,

    // Actions
    cancelSetupFlow,
    fetchAndSetDatasets,
    finalizeSetup,
    handleMainNavLinkEnter,
    handleMainNavLinkLeave,
    selectDataset,
    selectModelType,
    setActiveNavSegmentKey,
    setCoreDisplay,
    startSetupFlow,
    toggleTimeframe
  }

  return <HomeScreenContext.Provider value={value}>{children}</HomeScreenContext.Provider>
}

HomeScreenProvider.propTypes = {
  children: PropTypes.node.isRequired,
  currentUsername: PropTypes.string.isRequired
}
