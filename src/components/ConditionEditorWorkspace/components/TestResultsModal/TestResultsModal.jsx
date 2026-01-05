import React, { useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { isPriceBased } from '../../utils/formulaUtils'
import MiniChart from './components/MiniChart/MiniChart'
import PredictionOverlay from './components/PredictionOverlay/PredictionOverlay'
import './TestResultsModal.css'

const TestResultsModal = ({
  chartData,
  formulas,
  isOpen,
  isScanLoading = false,
  onClose,
  onRunFullScan,
  testResults
}) => {
  const [currentPredictionIndex, setCurrentPredictionIndex] = useState(0)
  const [isNextCandleVisible, setIsNextCandleVisible] = useState(false)
  const [hoverData, setHoverData] = useState(null)
  const [indicatorColors, setIndicatorColors] = useState({})
  const previousFormulasRef = useRef(formulas)

  // Determine if any formula is time-based (for hiding explore mode)
  const hasTimeBasedFormulas = useMemo(() => {
    if (!formulas) return false
    const allFormulas = [formulas.bullish, formulas.bearish, formulas.neutral].filter(Boolean)
    return allFormulas.some((formula) => !isPriceBased(formula))
  }, [formulas])

  // Reset prediction index only when formulas actually change
  useEffect(() => {
    const formulasChanged = JSON.stringify(previousFormulasRef.current) !== JSON.stringify(formulas)

    if (formulasChanged) {
      setCurrentPredictionIndex(0)
      setIsNextCandleVisible(false)
      previousFormulasRef.current = formulas
    }
  }, [formulas])

  if (!isOpen || !testResults) return null

  // Validate testResults structure
  if (
    !testResults.results ||
    !Array.isArray(testResults.results) ||
    testResults.results.length === 0
  ) {
    console.error('Invalid testResults: results array is missing or empty')
    return null
  }

  if (!testResults.metrics || typeof testResults.metrics !== 'object') {
    console.error('Invalid testResults: metrics object is missing')
    return null
  }

  const { results, metrics } = testResults
  const currentResult = results[currentPredictionIndex]

  if (!currentResult) {
    console.error('Invalid prediction index:', currentPredictionIndex)
    return null
  }

  const handlePrevious = () => {
    setCurrentPredictionIndex((prev) => Math.max(0, prev - 1))
    setIsNextCandleVisible(false)
  }

  const handleNext = () => {
    setCurrentPredictionIndex((prev) => Math.min(results.length - 1, prev + 1))
    setIsNextCandleVisible(false)
  }

  const handleToggleNextCandle = () => {
    setIsNextCandleVisible((prev) => !prev)
  }

  return (
    <div className="test-results-modal-overlay">
      <div className="test-results-modal">
        <div className="modal-header">
          <h2>Test Results Preview</h2>
          <span className="header-summary">
            {metrics.correctCount} of {metrics.totalPredictions} correct (
            {metrics.accuracyPercentage}% accuracy)
          </span>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <div className="test-results-chart-container">
            <MiniChart
              chartData={chartData}
              currentResult={currentResult}
              formulas={formulas}
              isNextCandleVisible={isNextCandleVisible}
              onHoverData={setHoverData}
              onIndicatorColors={setIndicatorColors}
            />

            <PredictionOverlay
              currentIndex={currentPredictionIndex}
              currentResult={currentResult}
              formulas={formulas}
              hasTimeBasedFormulas={hasTimeBasedFormulas}
              hoverData={hoverData}
              indicatorColors={indicatorColors}
              isNextCandleVisible={isNextCandleVisible}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onToggleNextCandle={handleToggleNextCandle}
              totalPredictions={results.length}
            />
          </div>

          <div className="action-buttons">
            <button className="btn-secondary" onClick={onClose}>
              Make Changes
            </button>
            <button
              className="btn-primary"
              disabled={isScanLoading}
              onClick={async () => {
                if (onRunFullScan) {
                  const response = await onRunFullScan()
                  if (response?.success) {
                    onClose()
                  }
                }
              }}
            >
              {isScanLoading ? 'Scanning...' : 'Looks Good - Run Full Scan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

TestResultsModal.propTypes = {
  chartData: PropTypes.arrayOf(
    PropTypes.shape({
      close: PropTypes.number.isRequired,
      high: PropTypes.number.isRequired,
      low: PropTypes.number.isRequired,
      open: PropTypes.number.isRequired,
      time: PropTypes.number.isRequired,
      volume: PropTypes.number.isRequired
    })
  ).isRequired,
  formulas: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  isScanLoading: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onRunFullScan: PropTypes.func,
  testResults: PropTypes.shape({
    metrics: PropTypes.shape({
      accuracyPercentage: PropTypes.number.isRequired,
      correctCount: PropTypes.number.isRequired,
      totalPredictions: PropTypes.number.isRequired
    }).isRequired,
    results: PropTypes.arrayOf(
      PropTypes.shape({
        accuracy: PropTypes.number.isRequired,
        actualDirection: PropTypes.string.isRequired,
        indicators: PropTypes.objectOf(
          PropTypes.arrayOf(
            PropTypes.shape({
              timestamp: PropTypes.number.isRequired,
              value: PropTypes.number.isRequired
            })
          )
        ),
        priceAtPrediction: PropTypes.number.isRequired,
        priceAtValidation: PropTypes.number,
        predictedBias: PropTypes.string.isRequired,
        timestamp: PropTypes.number.isRequired
      })
    ).isRequired
  })
}

export default TestResultsModal
