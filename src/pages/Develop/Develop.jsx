import React, { useContext, useEffect } from 'react'

import { AppViewContext } from '../../contexts/AppViewContext'
import './Develop.css'

/**
 * @description The main page for developing a new trading model.
 */
const Develop = ({ modelConfig }) => {
  const { navigateTo } = useContext(AppViewContext)

  useEffect(() => {
    console.log('DevelopPage mounted with config:', modelConfig)
  }, [modelConfig])

  return (
    <div className="develop-page">
      <header className="develop-page-header">
        <h1>Develop: {modelConfig?.dataset?.name || 'New Model'}</h1>
        <button onClick={() => navigateTo('home')}>← Back to Home</button>
      </header>
      <main className="develop-page-content">
        <p>Selected Model Type: {modelConfig?.type}</p>
        <p>Selected Dataset ID: {modelConfig?.dataset?.id}</p>
        <p>Selected Timeframes: {modelConfig?.selectedTimeframes?.join(', ')}</p>
        <p>--- Chart Area Placeholder ---</p>
        <p>--- Condition Editor Placeholder ---</p>
        <p>--- Results Table Placeholder ---</p>
      </main>
    </div>
  )
}

// Add PropTypes later when props are finalized

export default Develop
