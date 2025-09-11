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
  const [showNorthStar, setShowNorthStar] = useState(false)

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
        <div className="code-mode-placeholder-mini">[Code Mode - Monaco Editor]</div>
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
            isMinimized={true}
          />
          <PreviewSection
            displayState={displayState}
            handleDisplayToggle={handleDisplayToggle}
            isNeutralFormulaIncluded={isNeutralFormulaIncluded}
            previewRows={previewRows}
            statusMessage={statusMessage}
            isMinimized={true}
            showNorthStar={showNorthStar}
            onToggleNorthStar={() => setShowNorthStar(!showNorthStar)}
            biasDefinition={biasDefinition}
            onBiasDefinitionChange={(e) => setBiasDefinition(e.target.value)}
            formulaState={formulaState}
            hasFormulaChanges={hasFormulaChanges}
            handleFinishFormula={handleFinishFormula}
          />
        </div>
      )}
    </div>
  )

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
