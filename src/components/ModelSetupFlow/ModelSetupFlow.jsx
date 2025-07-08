import React from 'react'
import PropTypes from 'prop-types'
import './ModelSetupFlow.css'

/**
 * @description Renders the UI for a single step in the new model setup flow.
 */

const ModelSetupFlow = ({ step, onSelectType }) => {
  if (step === 'selectType') {
    return (
      <div className="model-setup-flow">
        <h3 className="setup-prompt">Select the type of model to develop</h3>
        <div className="setup-options">
          <button onClick={() => onSelectType('trading')} className="setup-option-button">
            Trading
          </button>
          <button onClick={() => onSelectType('bias')} className="setup-option-button">
            Bias
          </button>
        </div>
      </div>
    )
  }

  // We will add 'selectDataset' and 'selectTimeframe' steps here later

  return null // Or a loading/default state
}

ModelSetupFlow.propTypes = {
  step: PropTypes.string.isRequired,
  onSelectType: PropTypes.func.isRequired
}

export default ModelSetupFlow
