import React from 'react'
import PropTypes from 'prop-types'

import { useHomeScreen } from '../../contexts/HomeScreenContext'

import './ModelSetupFlow.css'

/**
 * @description Renders the UI for a single step in the new model setup flow.
 */

const ModelSetupFlow = ({ step, onSelectType }) => {
  const { cancelSetupFlow } = useHomeScreen()

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
    // Add other steps here later
    return <p>Loading next step...</p>
  }

  // We will add 'selectDataset' and 'selectTimeframe' steps here later
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
