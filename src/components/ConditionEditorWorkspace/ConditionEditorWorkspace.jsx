import React, { useState } from 'react'
import PropTypes from 'prop-types'

import './ConditionEditorWorkspace.css'

const ConditionEditorWorkspace = ({ currentView, modelType, onToggleFullScreen }) => {
  const [currentMode, setCurrentMode] = useState('GUI')

  const isFullScreen = currentView === 'condition-editor'
  const headerTitle = modelType === 'bias' ? 'Bias Condition Builder' : 'Trading Strategy Builder'

  const renderFullScreenContent = () => {
    if (currentMode === 'Code') {
      return (
        <div className="workspace-content full-screen">
          <div className="code-mode-placeholder">
            [Code Mode would show Monaco Editor with placeholder JavaScript condition code]
          </div>
        </div>
      )
    }

    return (
      <div className="workspace-content full-screen">
        <div className="preview-section">
          <h4>Preview</h4>
          <div className="section-content-centered">
            <div className="condition-summary">
              "When 1H SMA(20) {'>'} 1H SMA(50) → Bullish Bias" 📈
            </div>
          </div>
          <div className="preview-actions">
            <button className="test-sample-button">▶️ Test Sample</button>
            <button className="run-scan-button" disabled>🔍 Run Scan</button>
          </div>
        </div>

        <div className="condition-bias-section">
          <h4>Condition & Bias Builder</h4>
          <div className="section-content-centered">
            <div className="formula-row">
              <span>Formula 1:</span>
              <select className="timeframe-select">
                <option>1H</option>
              </select>
              <select className="indicator-select">
                <option>SMA(20)</option>
              </select>
              <select className="operator-select">
                <option>{'>'}</option>
              </select>
              <select className="indicator-select">
                <option>SMA(50)</option>
              </select>
              <span>──── Results in →</span>
              <select className="bias-result-select">
                <option>Bullish</option>
              </select>
              <span>Bias</span>
            </div>

            <div className="formula-options">
              <label>
                <input type="checkbox" />
                Add Formula 2 (for Bearish bias)
              </label>
              <label>
                <input type="checkbox" />
                Add Formula 3 (for Neutral bias)
              </label>
            </div>

            <div className="active-bias-levels">
              <span>Active Bias Levels:</span>
              <label>
                <input type="checkbox" checked readOnly />
                Bullish
              </label>
              <label>
                <input type="checkbox" />
                Neutral
              </label>
              <label>
                <input type="checkbox" />
                Bearish
              </label>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderMinimizedContent = () => {
    if (currentMode === 'Code') {
      return (
        <div className="workspace-content minimized">
          <div className="code-mode-placeholder-mini">[Code Mode - Monaco Editor]</div>
        </div>
      )
    }

    return (
      <div className="workspace-content minimized">
        <div className="accordion-sections">
          <div className="accordion-section condition-section">
            <div className="section-header">Base Condition</div>
            <div className="mini-section-content">
              <div className="formula-builder">
                <select className="mini-timeframe-select">
                  <option>1H</option>
                  <option>4H</option>
                  <option>1D</option>
                </select>
                <select className="mini-indicator-select">
                  <option>SMA(20)</option>
                  <option>EMA(20)</option>
                  <option>RSI</option>
                </select>
                <select className="mini-operator-select">
                  <option>{'>'}</option>
                  <option>{'<'}</option>
                  <option>=</option>
                </select>
                <select className="mini-value-select">
                  <option>SMA(50)</option>
                  <option>EMA(50)</option>
                  <option>Value</option>
                </select>
              </div>
              <div className="add-formula-hover">+</div>
            </div>
          </div>

          <div className="accordion-section bias-section">
            <div className="section-header">Bias</div>
            <div className="mini-section-content">
              <div className="bias-arrows">
                <div className="bias-option active">↗</div>
                <div className="bias-option">→</div>
                <div className="bias-option">↘</div>
              </div>
            </div>
          </div>

          <div className="accordion-section mini-preview-section">
            <div className="section-header">Preview</div>
            <div className="mini-section-content">
              <div className="mini-preview-text">"1H SMA(20) {'>'} SMA(50) → Bullish" 📈</div>
              <div className="mini-preview-actions">
                <button className="mini-test-button">Test</button>
                <button className="mini-scan-button" disabled>
                  Scan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="condition-editor-workspace">
      <div className="workspace-header">
        <h3>{headerTitle}</h3>
        <div className="header-controls">
          <div className="mode-switch">
            <span
              className={`mode-option ${currentMode === 'GUI' ? 'active' : ''}`}
              onClick={() => setCurrentMode('GUI')}
            >
              GUI
            </span>
            <span className="mode-separator">|</span>
            <span
              className={`mode-option ${currentMode === 'Code' ? 'active' : ''}`}
              onClick={() => setCurrentMode('Code')}
            >
              Code
            </span>
          </div>
          <button className="minimize-button" onClick={onToggleFullScreen}>
            {isFullScreen ? 'Minimize' : 'Maximize'}
          </button>
        </div>
      </div>

      {isFullScreen ? renderFullScreenContent() : renderMinimizedContent()}
    </div>
  )
}

ConditionEditorWorkspace.propTypes = {
  modelType: PropTypes.oneOf(['bias', 'trading']).isRequired,
  currentView: PropTypes.string.isRequired,
  onToggleFullScreen: PropTypes.func.isRequired
}

export default ConditionEditorWorkspace
