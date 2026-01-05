import React, { useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'

import CodeModeEditor from './components/CodeModeEditor/CodeModeEditor'
import ConditionBuilderSection from './components/ConditionBuilderSection/ConditionBuilderSection'
import Icon from '../Icon/Icon'
import NorthStarSection from './components/NorthStarSection/NorthStarSection'
import PreviewSection from './components/PreviewSection/PreviewSection'

import useDisplayControls from './hooks/useDisplayControls'
import useFormulaManager from './hooks/useFormulaManager'
import usePreviewGenerator from './hooks/usePreviewGenerator'

import './ConditionEditorWorkspace.css'

const ConditionEditorWorkspace = ({
  chartData,
  currentView,
  datasetId,
  isScanLoading,
  modelType,
  onRunFullScan,
  onScanReset,
  onToggleFullScreen,
  scanComplete,
  selectedTimeframes
}) => {
  const [biasDefinition, setBiasDefinition] = useState('')
  const [currentMode, setCurrentMode] = useState('GUI')
  const [isNeutralFormulaIncluded, setIsNeutralFormulaIncluded] = useState(true)
  const [showNorthStar, setShowNorthStar] = useState(false)

  // Track previous formula state to detect changes and clear scan results
  const previousFormulasRef = useRef(null)

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
    'full',
    scanComplete
  )

  // Generate preview data for minimized view (always include completed formulas)
  const { previewRows: minimizedPreviewRows } = usePreviewGenerator(
    formulaState,
    displayState,
    isNeutralFormulaIncluded,
    hasFormulaChanges,
    'minimized',
    scanComplete
  )

  // Detect formula changes and reset scan complete state when formulas are modified
  useEffect(() => {
    const currentFormulas = JSON.stringify(formulaState.completedFormulas)

    if (previousFormulasRef.current !== null && previousFormulasRef.current !== currentFormulas) {
      // Formulas have changed since last check - reset scan complete
      if (onScanReset) {
        onScanReset()
      }
    }

    previousFormulasRef.current = currentFormulas
  }, [formulaState.completedFormulas, onScanReset])

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
              chartData={chartData}
              datasetId={datasetId}
              displayState={displayState}
              formulaState={formulaState}
              formulaVisibility={displayState.displayFormulas}
              handleDisplayToggle={handleDisplayToggle}
              handleFinishFormula={handleFinishFormula}
              hasFormulaChanges={hasFormulaChanges}
              isNeutralFormulaIncluded={isNeutralFormulaIncluded}
              isScanLoading={isScanLoading}
              onFormulaVisibilityToggle={handleDisplayToggle}
              onRunFullScan={onRunFullScan}
              previewRows={fullScreenPreviewRows}
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
            biasDefinition={biasDefinition}
            chartData={chartData}
            datasetId={datasetId}
            displayState={displayState}
            formulaState={formulaState}
            formulaVisibility={displayState.displayFormulas}
            handleDisplayToggle={handleDisplayToggle}
            handleFinishFormula={handleFinishFormula}
            hasFormulaChanges={hasFormulaChanges}
            isMinimized={true}
            isNeutralFormulaIncluded={isNeutralFormulaIncluded}
            isScanLoading={isScanLoading}
            onBiasDefinitionChange={(e) => setBiasDefinition(e.target.value)}
            onFormulaVisibilityToggle={handleDisplayToggle}
            onRunFullScan={onRunFullScan}
            onToggleNorthStar={() => setShowNorthStar(!showNorthStar)}
            previewRows={minimizedPreviewRows}
            showNorthStar={showNorthStar}
            statusMessage={statusMessage}
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
          <button
            className={`fullscreen-toggle-button-base ${isFullScreen ? 'active' : ''}`}
            onClick={onToggleFullScreen}
            title={isFullScreen ? 'Minimize' : 'Maximize'}
          >
            <Icon icon="fullscreen" />
          </button>
        </div>
      </div>

      {isFullScreen ? renderFullScreenContent() : renderMinimizedContent()}
    </div>
  )
}

ConditionEditorWorkspace.propTypes = {
  chartData: PropTypes.arrayOf(
    PropTypes.shape({
      close: PropTypes.number.isRequired,
      high: PropTypes.number.isRequired,
      low: PropTypes.number.isRequired,
      open: PropTypes.number.isRequired,
      time: PropTypes.number.isRequired,
      volume: PropTypes.number.isRequired
    })
  ),
  currentView: PropTypes.string.isRequired,
  datasetId: PropTypes.number,
  isScanLoading: PropTypes.bool,
  modelType: PropTypes.oneOf(['bias', 'trading']).isRequired,
  onRunFullScan: PropTypes.func,
  onScanReset: PropTypes.func,
  onToggleFullScreen: PropTypes.func.isRequired,
  scanComplete: PropTypes.bool,
  selectedTimeframes: PropTypes.arrayOf(PropTypes.string)
}

export default ConditionEditorWorkspace
