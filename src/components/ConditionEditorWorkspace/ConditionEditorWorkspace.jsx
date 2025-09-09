import React, { useState, useMemo } from 'react'
import PropTypes from 'prop-types'

import CodeModeEditor from './components/CodeModeEditor/CodeModeEditor'
import ConditionBuilderSection from './components/ConditionBuilderSection/ConditionBuilderSection'
import NorthStarSection from './components/NorthStarSection/NorthStarSection'
import PreviewSection from './components/PreviewSection/PreviewSection'

import useDisplayControls from './hooks/useDisplayControls'
import useFormulaManager from './hooks/useFormulaManager'
import usePreviewGenerator from './hooks/usePreviewGenerator'

import './ConditionEditorWorkspace.css'

const ConditionEditorWorkspace = ({ currentView, modelType, onToggleFullScreen }) => {
  const [biasDefinition, setBiasDefinition] = useState('')
  const [currentMode, setCurrentMode] = useState('GUI')
  const [isNeutralFormulaIncluded, setIsNeutralFormulaIncluded] = useState(true)

  const { displayState, handleDisplayToggle } = useDisplayControls()

  const { formulaState, hasFormulaChanges, handleCurrentFormulaChange, handleFinishFormula } =
    useFormulaManager(isNeutralFormulaIncluded, (biasType) => {
      // When a formula is completed, ensure it's displayed
      if (!displayState.displayFormulas[biasType]) {
        handleDisplayToggle(biasType)
      }
    })

  const { previewRows, statusMessage } = usePreviewGenerator(
    formulaState,
    displayState,
    isNeutralFormulaIncluded,
    hasFormulaChanges
  )

  const isFullScreen = useMemo(() => currentView === 'condition-editor', [currentView])
  const headerTitle = useMemo(
    () => (modelType === 'bias' ? 'Bias Condition Builder' : 'Trading Strategy Builder'),
    [modelType]
  )

  const handleBiasDefinitionChange = (event) => {
    setBiasDefinition(event.target.value)
  }

  const renderFullScreenContent = () => {
    if (currentMode === 'Code') {
      return (
        <div className="workspace-content full-screen">
          <div className="main-content-area">
            <CodeModeEditor />
          </div>

          <NorthStarSection value={biasDefinition} onChange={handleBiasDefinitionChange} />
        </div>
      )
    }

    return (
      <div className="workspace-content full-screen">
        <div className="main-content-area">
          <PreviewSection
            displayState={displayState}
            handleDisplayToggle={handleDisplayToggle}
            isNeutralFormulaIncluded={isNeutralFormulaIncluded}
            previewRows={previewRows}
            statusMessage={statusMessage}
          />

          <ConditionBuilderSection
            formulaState={formulaState}
            hasFormulaChanges={hasFormulaChanges}
            handleCurrentFormulaChange={handleCurrentFormulaChange}
            handleFinishFormula={handleFinishFormula}
            isNeutralFormulaIncluded={isNeutralFormulaIncluded}
            setIsNeutralFormulaIncluded={setIsNeutralFormulaIncluded}
            displayState={displayState}
            handleDisplayToggle={handleDisplayToggle}
          />
        </div>

        <NorthStarSection value={biasDefinition} onChange={handleBiasDefinitionChange} />
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
