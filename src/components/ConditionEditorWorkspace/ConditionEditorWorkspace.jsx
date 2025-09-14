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
  currentView: PropTypes.string.isRequired,
  modelType: PropTypes.oneOf(['bias', 'trading']).isRequired,
  onToggleFullScreen: PropTypes.func.isRequired,
  selectedTimeframes: PropTypes.arrayOf(PropTypes.string)
}

export default ConditionEditorWorkspace
