import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'

import CarouselSelector from '../CarouselSelector/CarouselSelector'

import { AppViewContext } from '../../contexts/AppViewContext'
import { useHomeScreen } from '../../contexts/HomeScreenContext'

import './ModelSetupFlow.css'

/**
 * @description Renders the UI for a single step in the new model setup flow.
 */

const ModelSetupFlow = ({ step, onSelectType }) => {
  const {
    cancelSetupFlow,
    datasets,
    finalizeSetup,
    newModelConfig,
    selectDataset,
    setupStep,
    toggleTimeframe
  } = useHomeScreen()
  const [countdown, setCountdown] = useState(3)

  const { navigateTo } = useContext(AppViewContext)

  useEffect(() => {
    let redirectTimer
    let countdownInterval

    if (setupStep === 'noDatasets') {
      setCountdown(3)

      countdownInterval = setInterval(() => {
        setCountdown((prev) => (prev > 1 ? prev - 1 : 1))
      }, 1000)

      redirectTimer = setTimeout(() => {
        navigateTo('settings')
      }, 3100)
    }
    return () => {
      clearTimeout(redirectTimer)
      clearInterval(countdownInterval)
    }
  }, [setupStep, navigateTo, cancelSetupFlow])

  const renderStepContent = () => {
    if (step === 'selectType') {
      return (
        <>
          <h3 className="setup-prompt">Select the type of model to develop</h3>
          <div className="setup-options">
            <button onClick={() => onSelectType('trading')} className="setup-text-button">
              <span>Trading</span>
            </button>
            <button onClick={() => onSelectType('bias')} className="setup-text-button">
              <span>Bias</span>
            </button>
          </div>
        </>
      )
    }

    if (step === 'noDatasets') {
      return (
        <div className="setup-message-container">
          <h3 className="setup-prompt">No Datasets Found</h3>
          <p className="setup-sub-prompt">Redirecting to Data Management to import data...</p>
          <div className="countdown-timer">{countdown}</div>
        </div>
      )
    }

    if (step === 'selectDataset') {
      return (
        <>
          <h3 className="setup-prompt">Select a Dataset</h3>
          <CarouselSelector items={datasets} onSelect={selectDataset} />
        </>
      )
    }

    if (setupStep === 'selectTimeframe') {
      const availableTFs = newModelConfig.dataset?.availableTimeframes?.split(',') || []
      const selectedTFs = newModelConfig.selectedTimeframes || []
      const maxSelected = selectedTFs.length >= 3

      return (
        <>
          <h3 className="setup-prompt">Select up to 3 Timeframes</h3>
          <div className="setup-options timeframe-chips-container">
            {availableTFs.map((tf) => {
              const isSelected = selectedTFs.includes(tf)
              const isDisabled = !isSelected && maxSelected
              return (
                <button
                  key={tf}
                  className={`timeframe-chip ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleTimeframe(tf)}
                  disabled={isDisabled}
                >
                  {tf}
                </button>
              )
            })}
          </div>
          <button
            className="setup-next-button"
            onClick={finalizeSetup}
            disabled={selectedTFs.length === 0}
          >
            Next →
          </button>
        </>
      )
    }

    if (setupStep === 'transitioning') {
      return <p className="setup-prompt">Preparing development environment...</p>
    }
  }

  return (
    <div className="model-setup-flow">
      <button onClick={cancelSetupFlow} className="setup-close-button" title="Cancel Setup">
        ×
      </button>
      {renderStepContent()}
    </div>
  )
}

ModelSetupFlow.propTypes = {
  step: PropTypes.string.isRequired,
  onSelectType: PropTypes.func.isRequired
}

export default ModelSetupFlow
