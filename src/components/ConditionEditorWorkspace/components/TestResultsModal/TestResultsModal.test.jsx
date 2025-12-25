import React from 'react'
import { render, screen } from '@testing-library/react'
import TestResultsModal from './TestResultsModal'

// Mock child components
jest.mock('./components/MiniChart/MiniChart', () => {
  return function MockMiniChart() {
    return <div data-testid="mini-chart">Mini Chart</div>
  }
})

jest.mock('./components/PredictionOverlay/PredictionOverlay', () => {
  return function MockPredictionOverlay() {
    return <div data-testid="prediction-overlay">Prediction Overlay</div>
  }
})

describe('TestResultsModal Component - Defensive Checks', () => {
  const mockFormulas = {
    bullish: {
      biasType: 'bullish',
      timeframe: '1H',
      indicator1: 'SMA',
      indicator1Param: 20,
      operator: '>',
      indicator2: 'PDH',
      indicator2Param: null
    }
  }

  const mockChartData = [
    { time: 1000, open: 100, high: 110, low: 90, close: 105, volume: 1000 },
    { time: 2000, open: 105, high: 115, low: 95, close: 110, volume: 1500 }
  ]

  const validTestResults = {
    results: [
      {
        timestamp: 1000,
        predictedBias: 'bullish',
        actualDirection: 'bullish',
        accuracy: 1,
        priceAtPrediction: 21430,
        priceAtValidation: 21480,
        indicators: {
          sma20: [{ timestamp: 1000, value: 21400 }],
          pdh: [{ timestamp: 1000, value: 21200 }]
        }
      },
      {
        timestamp: 2000,
        predictedBias: 'bullish',
        actualDirection: 'neutral',
        accuracy: 0,
        priceAtPrediction: 21480,
        priceAtValidation: 21485,
        indicators: {
          sma20: [{ timestamp: 2000, value: 21450 }],
          pdh: [{ timestamp: 2000, value: 21200 }]
        }
      },
      {
        timestamp: 3000,
        predictedBias: 'bearish',
        actualDirection: 'bearish',
        accuracy: 1,
        priceAtPrediction: 21485,
        priceAtValidation: 21400,
        indicators: {
          sma20: [{ timestamp: 3000, value: 21470 }],
          pdh: [{ timestamp: 3000, value: 21200 }]
        }
      }
    ],
    metrics: {
      totalPredictions: 3,
      correctCount: 2,
      accuracyPercentage: 66.67
    }
  }

  const defaultProps = {
    chartData: mockChartData,
    formulas: mockFormulas,
    isOpen: true,
    onClose: jest.fn(),
    testResults: validTestResults
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Suppress console.error for tests that intentionally trigger errors
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    console.error.mockRestore()
  })

  describe('Defensive Validation - Returns Null', () => {
    it('returns null when isOpen is false', () => {
      const { container } = render(<TestResultsModal {...defaultProps} isOpen={false} />)

      expect(container.firstChild).toBeNull()
    })

    it('returns null when testResults is null', () => {
      const { container } = render(<TestResultsModal {...defaultProps} testResults={null} />)

      expect(container.firstChild).toBeNull()
    })

    it('returns null when testResults is undefined', () => {
      const { container } = render(<TestResultsModal {...defaultProps} testResults={undefined} />)

      expect(container.firstChild).toBeNull()
    })

    it('returns null when results array is missing', () => {
      const invalidTestResults = {
        // No results array
        metrics: {
          totalPredictions: 0,
          correctCount: 0,
          accuracyPercentage: 0
        }
      }

      const { container } = render(
        <TestResultsModal {...defaultProps} testResults={invalidTestResults} />
      )

      expect(container.firstChild).toBeNull()
      expect(console.error).toHaveBeenCalledWith(
        'Invalid testResults: results array is missing or empty'
      )
    })

    it('returns null when results is not an array', () => {
      const invalidTestResults = {
        results: 'not an array',
        metrics: {
          totalPredictions: 0,
          correctCount: 0,
          accuracyPercentage: 0
        }
      }

      const { container } = render(
        <TestResultsModal {...defaultProps} testResults={invalidTestResults} />
      )

      expect(container.firstChild).toBeNull()
      expect(console.error).toHaveBeenCalledWith(
        'Invalid testResults: results array is missing or empty'
      )
    })

    it('returns null when results array is empty', () => {
      const invalidTestResults = {
        results: [],
        metrics: {
          totalPredictions: 0,
          correctCount: 0,
          accuracyPercentage: 0
        }
      }

      const { container } = render(
        <TestResultsModal {...defaultProps} testResults={invalidTestResults} />
      )

      expect(container.firstChild).toBeNull()
      expect(console.error).toHaveBeenCalledWith(
        'Invalid testResults: results array is missing or empty'
      )
    })

    it('returns null when metrics object is missing', () => {
      const invalidTestResults = {
        results: [
          {
            timestamp: 1000,
            predictedBias: 'bullish',
            actualDirection: 'bullish',
            accuracy: 1
          }
        ]
        // No metrics object
      }

      const { container } = render(
        <TestResultsModal {...defaultProps} testResults={invalidTestResults} />
      )

      expect(container.firstChild).toBeNull()
      expect(console.error).toHaveBeenCalledWith(
        'Invalid testResults: metrics object is missing'
      )
    })

    it('returns null when metrics is not an object', () => {
      const invalidTestResults = {
        results: [
          {
            timestamp: 1000,
            predictedBias: 'bullish',
            actualDirection: 'bullish',
            accuracy: 1
          }
        ],
        metrics: 'not an object'
      }

      const { container } = render(
        <TestResultsModal {...defaultProps} testResults={invalidTestResults} />
      )

      expect(container.firstChild).toBeNull()
      expect(console.error).toHaveBeenCalledWith(
        'Invalid testResults: metrics object is missing'
      )
    })

    it('returns null when currentResult is invalid (index out of bounds)', () => {
      // This would happen if the results array changes while modal is open
      // and currentPredictionIndex points to invalid index
      const singleResultTestResults = {
        results: [
          {
            timestamp: 1000,
            predictedBias: 'bullish',
            actualDirection: 'bullish',
            accuracy: 1,
            priceAtPrediction: 21430,
            priceAtValidation: 21480,
            indicators: {}
          }
        ],
        metrics: {
          totalPredictions: 1,
          correctCount: 1,
          accuracyPercentage: 100
        }
      }

      const { container, rerender } = render(
        <TestResultsModal {...defaultProps} testResults={singleResultTestResults} />
      )

      // Modal should render initially
      expect(container.firstChild).not.toBeNull()

      // Now update testResults to empty array (simulating data corruption)
      const corruptedTestResults = {
        results: [],
        metrics: {
          totalPredictions: 0,
          correctCount: 0,
          accuracyPercentage: 0
        }
      }

      rerender(<TestResultsModal {...defaultProps} testResults={corruptedTestResults} />)

      // Modal should return null for corrupted data
      expect(container.firstChild).toBeNull()
    })
  })

  describe('Valid Rendering', () => {
    it('renders modal when all data is valid', () => {
      render(<TestResultsModal {...defaultProps} />)

      expect(screen.getByText('Test Results Preview')).toBeInTheDocument()
      expect(screen.getByTestId('mini-chart')).toBeInTheDocument()
      expect(screen.getByTestId('prediction-overlay')).toBeInTheDocument()
    })

    it('renders summary with correct metrics', () => {
      render(<TestResultsModal {...defaultProps} />)

      expect(screen.getByText(/2 of 3 correct/)).toBeInTheDocument()
      expect(screen.getByText(/66.67% accuracy/)).toBeInTheDocument()
    })

    it('renders action buttons', () => {
      render(<TestResultsModal {...defaultProps} />)

      expect(screen.getByText('Make Changes')).toBeInTheDocument()
      expect(screen.getByText('Looks Good - Run Full Scan')).toBeInTheDocument()
    })

    it('renders with single result', () => {
      const singleResultTestResults = {
        results: [
          {
            timestamp: 1000,
            predictedBias: 'bullish',
            actualDirection: 'bullish',
            accuracy: 1,
            priceAtPrediction: 21430,
            priceAtValidation: 21480,
            indicators: {}
          }
        ],
        metrics: {
          totalPredictions: 1,
          correctCount: 1,
          accuracyPercentage: 100
        }
      }

      render(<TestResultsModal {...defaultProps} testResults={singleResultTestResults} />)

      expect(screen.getByText(/1 of 1 correct/)).toBeInTheDocument()
      expect(screen.getByText(/100% accuracy/)).toBeInTheDocument()
    })

    it('renders with multiple results', () => {
      render(<TestResultsModal {...defaultProps} />)

      // Should render without errors
      expect(screen.getByText('Test Results Preview')).toBeInTheDocument()
      expect(screen.getByTestId('mini-chart')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles metrics with 0% accuracy', () => {
      const zeroAccuracyResults = {
        results: [
          {
            timestamp: 1000,
            predictedBias: 'bullish',
            actualDirection: 'bearish',
            accuracy: 0,
            priceAtPrediction: 21430,
            priceAtValidation: 21400,
            indicators: {}
          }
        ],
        metrics: {
          totalPredictions: 1,
          correctCount: 0,
          accuracyPercentage: 0
        }
      }

      render(<TestResultsModal {...defaultProps} testResults={zeroAccuracyResults} />)

      expect(screen.getByText(/0 of 1 correct/)).toBeInTheDocument()
      expect(screen.getByText(/0% accuracy/)).toBeInTheDocument()
    })

    it('handles metrics with 100% accuracy', () => {
      const perfectAccuracyResults = {
        results: [
          {
            timestamp: 1000,
            predictedBias: 'bullish',
            actualDirection: 'bullish',
            accuracy: 1,
            priceAtPrediction: 21430,
            priceAtValidation: 21480,
            indicators: {}
          }
        ],
        metrics: {
          totalPredictions: 1,
          correctCount: 1,
          accuracyPercentage: 100
        }
      }

      render(<TestResultsModal {...defaultProps} testResults={perfectAccuracyResults} />)

      expect(screen.getByText(/1 of 1 correct/)).toBeInTheDocument()
      expect(screen.getByText(/100% accuracy/)).toBeInTheDocument()
    })

    it('handles decimal accuracy percentages', () => {
      const decimalAccuracyResults = {
        results: [
          {
            timestamp: 1000,
            predictedBias: 'bullish',
            actualDirection: 'bullish',
            accuracy: 1,
            priceAtPrediction: 21430,
            priceAtValidation: 21480,
            indicators: {}
          },
          {
            timestamp: 2000,
            predictedBias: 'bullish',
            actualDirection: 'neutral',
            accuracy: 0,
            priceAtPrediction: 21480,
            priceAtValidation: 21485,
            indicators: {}
          },
          {
            timestamp: 3000,
            predictedBias: 'bearish',
            actualDirection: 'bullish',
            accuracy: 0,
            priceAtPrediction: 21485,
            priceAtValidation: 21500,
            indicators: {}
          }
        ],
        metrics: {
          totalPredictions: 3,
          correctCount: 1,
          accuracyPercentage: 33.33
        }
      }

      render(<TestResultsModal {...defaultProps} testResults={decimalAccuracyResults} />)

      expect(screen.getByText(/1 of 3 correct/)).toBeInTheDocument()
      expect(screen.getByText(/33.33% accuracy/)).toBeInTheDocument()
    })
  })

  describe('Console Error Logging', () => {
    it('logs error for missing results array', () => {
      const invalidTestResults = {
        metrics: { totalPredictions: 0, correctCount: 0, accuracyPercentage: 0 }
      }

      render(<TestResultsModal {...defaultProps} testResults={invalidTestResults} />)

      expect(console.error).toHaveBeenCalledWith(
        'Invalid testResults: results array is missing or empty'
      )
    })

    it('logs error for missing metrics object', () => {
      const invalidTestResults = {
        results: [{ timestamp: 1000, predictedBias: 'bullish' }]
      }

      render(<TestResultsModal {...defaultProps} testResults={invalidTestResults} />)

      expect(console.error).toHaveBeenCalledWith(
        'Invalid testResults: metrics object is missing'
      )
    })

    it('does not log errors for valid data', () => {
      render(<TestResultsModal {...defaultProps} />)

      expect(console.error).not.toHaveBeenCalled()
    })
  })
})
