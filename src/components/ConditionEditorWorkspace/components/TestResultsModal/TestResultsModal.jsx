import React, { useState } from 'react'
import PropTypes from 'prop-types'
import MiniChart from './components/MiniChart/MiniChart'
import './TestResultsModal.css'

const TestResultsModal = ({ chartData, formulas, isOpen, onClose, testResults }) => {
  const [currentPredictionIndex, setCurrentPredictionIndex] = useState(0)
  const [isNextCandleVisible, setIsNextCandleVisible] = useState(false)

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
              onToggleNextCandle={handleToggleNextCandle}
            />

            {/* Prediction overlay - implemented in T021.10.7 */}
            <div className="test-results-prediction-overlay-placeholder">
              [Prediction Overlay Here]
            </div>
          </div>

          <div className="navigation-controls">
            <button onClick={handlePrevious} disabled={currentPredictionIndex === 0}>
              ◄ Prev
            </button>
            <span className="navigation-label">
              Prediction {currentPredictionIndex + 1} of {results.length}
            </span>
            <button onClick={handleNext} disabled={currentPredictionIndex === results.length - 1}>
              Next ►
            </button>
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
        indicators: PropTypes.object,
        priceAtPrediction: PropTypes.number.isRequired,
        priceAtValidation: PropTypes.number,
        predictedBias: PropTypes.string.isRequired,
        timestamp: PropTypes.number.isRequired
      })
    ).isRequired
  })
}

export default TestResultsModal
