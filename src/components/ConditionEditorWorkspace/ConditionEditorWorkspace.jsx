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

const ConditionEditorWorkspace = ({
  currentView,
  modelType,
  onToggleFullScreen,
  selectedTimeframes
}) => {
  const [biasDefinition, setBiasDefinition] = useState('')
  const [currentMode, setCurrentMode] = useState('GUI')
  const [isNeutralFormulaIncluded, setIsNeutralFormulaIncluded] = useState(true)
  const [showNorthStar, setShowNorthStar] = useState(false)

  // Centralized feature toggle management
  const [featureToggles, setFeatureToggles] = useState({
    useNewFormulaBuilder: false,
    useNewActionButtons: false,
    useNewPreviewText: false
  })

  const toggleFeature = (feature) => {
    setFeatureToggles((prev) => ({ ...prev, [feature]: !prev[feature] }))
  }

  const setAllToggles = (enabled) => {
    setFeatureToggles({
      useNewFormulaBuilder: enabled,
      useNewActionButtons: enabled,
      useNewPreviewText: enabled
    })
  }

  const { displayState, handleDisplayToggle } = useDisplayControls()

  const { formulaState, hasFormulaChanges, handleCurrentFormulaChange, handleFinishFormula } =
    useFormulaManager(isNeutralFormulaIncluded, (biasType) => {
      // When a formula is completed, ensure it's displayed
      if (!displayState.displayFormulas[biasType]) {
        handleDisplayToggle(biasType)
      }
    })

  const { previewRows: fullScreenPreviewRows, statusMessage } = usePreviewGenerator(
    formulaState,
    displayState,
    isNeutralFormulaIncluded,
    hasFormulaChanges,
    'full'
  )

  // Generate preview data for minimized view (always include completed formulas)
  const { previewRows: minimizedPreviewRows } = usePreviewGenerator(
    formulaState,
    displayState,
    isNeutralFormulaIncluded,
    hasFormulaChanges,
    'minimized'
  )

  const isFullScreen = useMemo(() => currentView === 'condition-editor', [currentView])
  const headerTitle = useMemo(
    () => (modelType === 'bias' ? 'Bias Condition Builder' : 'Trading Strategy Builder'),
    [modelType]
  )

  // Development-only comprehensive testing UI
  const renderDevToggles = () => {
    if (process.env.NODE_ENV !== 'development') return null

    return (
      <div
        className="dev-testing-panel"
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: '#1a1a1a',
          color: '#fff',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '12px',
          zIndex: 9999,
          minWidth: '280px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
      >
        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', textAlign: 'center' }}>
          🧪 Component Testing Dashboard
        </h4>
        <div style={{ display: 'grid', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px' }}>
            <input
              type="checkbox"
              checked={
                featureToggles.useNewFormulaBuilder &&
                featureToggles.useNewActionButtons &&
                featureToggles.useNewPreviewText
              }
              onChange={(e) => setAllToggles(e.target.checked)}
              style={{ transform: 'scale(1.2)' }}
            />
            <span style={{ fontWeight: 'bold', color: '#4ade80' }}>🚀 Use All New Components</span>
          </label>
          <div style={{ borderTop: '1px solid #333', margin: '8px 0' }}></div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px' }}>
            <input
              type="checkbox"
              checked={featureToggles.useNewFormulaBuilder}
              onChange={() => toggleFeature('useNewFormulaBuilder')}
            />
            <span>📋 FormulaBuilder</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px' }}>
            <input
              type="checkbox"
              checked={featureToggles.useNewActionButtons}
              onChange={() => toggleFeature('useNewActionButtons')}
            />
            <span>🎯 ActionButtons</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px' }}>
            <input
              type="checkbox"
              checked={featureToggles.useNewPreviewText}
              onChange={() => toggleFeature('useNewPreviewText')}
            />
            <span>👁️ PreviewText</span>
          </label>
        </div>
        <div style={{ marginTop: '12px', display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setAllToggles(false)}
            style={{
              flex: 1,
              fontSize: '10px',
              padding: '6px 8px',
              background: '#dc2626',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Reset to Old
          </button>
          <button
            onClick={() => setAllToggles(true)}
            style={{
              flex: 1,
              fontSize: '10px',
              padding: '6px 8px',
              background: '#16a34a',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Set to New
          </button>
        </div>
        <div style={{ marginTop: '8px', fontSize: '10px', color: '#888', textAlign: 'center' }}>
          {Object.values(featureToggles).filter(Boolean).length} /{' '}
          {Object.keys(featureToggles).length} components using new implementation
        </div>
      </div>
    )
  }

  const renderFullScreenContent = () => (
    <div className="workspace-content full-screen">
      <div className="main-content-area">
        {currentMode === 'Code' ? (
          <CodeModeEditor />
        ) : (
          <>
            <PreviewSection
              displayState={displayState}
              handleDisplayToggle={handleDisplayToggle}
              isNeutralFormulaIncluded={isNeutralFormulaIncluded}
              previewRows={fullScreenPreviewRows}
              statusMessage={statusMessage}
              formulaVisibility={displayState.displayFormulas}
              onFormulaVisibilityToggle={handleDisplayToggle}
              useNewPreviewText={featureToggles.useNewPreviewText}
              useNewActionButtons={featureToggles.useNewActionButtons}
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
              selectedTimeframes={selectedTimeframes}
              useNewFormulaBuilder={featureToggles.useNewFormulaBuilder}
              useNewActionButtons={featureToggles.useNewActionButtons}
            />
          </>
        )}
      </div>
      <NorthStarSection
        value={biasDefinition}
        onChange={(event) => setBiasDefinition(event.target.value)}
      />
    </div>
  )

  const renderMinimizedContent = () => (
    <div className="workspace-content minimized">
      {currentMode === 'Code' ? (
        <div className="code-mode-minimized">
          <div className="code-mode-header">
            <span className="code-mode-title">Code Mode</span>
            <button
              className={`north-star-toggle ${showNorthStar ? 'active' : ''}`}
              onClick={() => setShowNorthStar(!showNorthStar)}
              title={showNorthStar ? 'Hide North Star' : 'Show North Star'}
            >
              ⭐
            </button>
          </div>
          <div className="code-mode-content">
            <div className="code-editor-section">
              <div className="code-mode-placeholder">[Monaco Editor]</div>
            </div>
            {showNorthStar && (
              <div className="north-star-section-code">
                <textarea
                  className="north-star-textarea"
                  placeholder="Define the North Star for this bias model..."
                  value={biasDefinition}
                  onChange={(event) => setBiasDefinition(event.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mini-sections">
          <ConditionBuilderSection
            formulaState={formulaState}
            hasFormulaChanges={hasFormulaChanges}
            handleCurrentFormulaChange={handleCurrentFormulaChange}
            handleFinishFormula={handleFinishFormula}
            isNeutralFormulaIncluded={isNeutralFormulaIncluded}
            setIsNeutralFormulaIncluded={setIsNeutralFormulaIncluded}
            displayState={displayState}
            handleDisplayToggle={handleDisplayToggle}
            selectedTimeframes={selectedTimeframes}
            isMinimized={true}
            useNewFormulaBuilder={featureToggles.useNewFormulaBuilder}
            useNewActionButtons={featureToggles.useNewActionButtons}
          />
          <PreviewSection
            displayState={displayState}
            handleDisplayToggle={handleDisplayToggle}
            isNeutralFormulaIncluded={isNeutralFormulaIncluded}
            previewRows={minimizedPreviewRows}
            statusMessage={statusMessage}
            formulaVisibility={displayState.displayFormulas}
            onFormulaVisibilityToggle={handleDisplayToggle}
            isMinimized={true}
            showNorthStar={showNorthStar}
            onToggleNorthStar={() => setShowNorthStar(!showNorthStar)}
            biasDefinition={biasDefinition}
            onBiasDefinitionChange={(e) => setBiasDefinition(e.target.value)}
            formulaState={formulaState}
            hasFormulaChanges={hasFormulaChanges}
            handleFinishFormula={handleFinishFormula}
            useNewPreviewText={featureToggles.useNewPreviewText}
            useNewActionButtons={featureToggles.useNewActionButtons}
          />
        </div>
      )}
    </div>
  )

  return (
    <div className="condition-editor-workspace">
      {renderDevToggles()}
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
  currentView: PropTypes.string.isRequired,
  modelType: PropTypes.oneOf(['bias', 'trading']).isRequired,
  onToggleFullScreen: PropTypes.func.isRequired,
  selectedTimeframes: PropTypes.arrayOf(PropTypes.string)
}

export default ConditionEditorWorkspace
