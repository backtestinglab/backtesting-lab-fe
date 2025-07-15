import React, { useContext, useEffect } from 'react'

import logo from '../../assets/logo.svg'

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
        <div className="header-left">
          <img src={logo} className="header-logo" alt="BacktestingLab Logo" />
        </div>
        <div className="header-center">
          <div className="header-title">
            <span className="header-prefix">Develop:</span>
            <span className="header-dataset-name">{modelConfig?.dataset?.name || 'New Model'}</span>
          </div>
        </div>
        <div className="header-right">
          <button className="back-button" onClick={() => navigateTo('home')}>
            ← Home
          </button>
        </div>
      </header>
      <main className="develop-workspace">
        <section className="chart-area">
          <div className="placeholder-text">Chart Area</div>
        </section>

        <section className="condition-editor-area">
          <div className="panel-header">
            <h3>Base Condition</h3>
            {/* Add buttons for GUI/JS mode, minimize, etc. later */}
          </div>
          <div className="placeholder-text">Condition Editor</div>
        </section>

        <section className="results-area">
          <div className="panel-header">
            <h3>Occurrences (0)</h3>
            <div className="results-controls">
              <button title="Previous Occurrence" className="up-arrow">
                ▲
              </button>
              <button title="Next Occurrence" className="down-arrow">
                ▲
              </button>
            </div>
          </div>
          <div className="placeholder-text">Results Table</div>
        </section>
      </main>
    </div>
  )
}

// Add PropTypes later when props are finalized

export default Develop
