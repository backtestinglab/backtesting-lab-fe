import React, { useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { isPriceBased } from '../../utils/formulaUtils'
import MiniChart from './components/MiniChart/MiniChart'
import PredictionOverlay from './components/PredictionOverlay/PredictionOverlay'
import './TestResultsModal.css'

const TestResultsModal = ({ chartData, formulas, isOpen, onClose, testResults }) => {
  const [currentPredictionIndex, setCurrentPredictionIndex] = useState(0)
  const [isNextCandleVisible, setIsNextCandleVisible] = useState(false)
  const [hoverData, setHoverData] = useState(null)
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

  const { results, metrics } = testResults
  const currentResult = results[currentPredictionIndex]

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
            />

            <PredictionOverlay
              currentIndex={currentPredictionIndex}
              currentResult={currentResult}
              formulas={formulas}
              hasTimeBasedFormulas={hasTimeBasedFormulas}
              hoverData={hoverData}
              isNextCandleVisible={isNextCandleVisible}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onToggleNextCandle={handleToggleNextCandle}
              totalPredictions={results.length}
            />
          </div>

          <div className="summary-section">
            <div className="summary-content">
              Summary: {metrics.correctCount} of {metrics.totalPredictions} correct (
              {metrics.accuracyPercentage}% accuracy)
            </div>
          </div>

          <div className="action-buttons">
            <button className="btn-secondary" onClick={onClose}>
              Make Changes
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                onClose()
                // TODO: Trigger full scan (implement in S021.12)
              }}
            >
              Looks Good - Run Full Scan
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
  onClose: PropTypes.func.isRequired,
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
