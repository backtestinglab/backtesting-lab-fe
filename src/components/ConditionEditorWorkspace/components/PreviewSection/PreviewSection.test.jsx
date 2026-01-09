import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PreviewSection from './PreviewSection'

// Mock the TestResultsModal component
jest.mock('../TestResultsModal/TestResultsModal', () => {
  return function MockTestResultsModal({ isOpen, testResults }) {
    if (!isOpen) return null
    return (
      <div data-testid="test-results-modal">
        Test Results Modal - {testResults?.results?.length || 0} results
      </div>
    )
  }
})

// Mock formulaUtils functions
jest.mock('../../utils/formulaUtils', () => ({
  shouldShowFinishButton: jest.fn(() => false),
  getFinishButtonText: jest.fn(() => '')
}))

// Mock PreviewText component
jest.mock('./components/PreviewText/PreviewText', () => {
  return function MockPreviewText() {
    return <div data-testid="preview-text">Preview Text</div>
  }
})

// Mock ActionButtons component
jest.mock('../ConditionBuilderSection/components/ActionButtons/ActionButtons', () => {
  return function MockActionButtons({ buttons }) {
    return (
      <div data-testid="action-buttons">
        {buttons.map((btn, idx) => (
          <button key={idx} onClick={btn.onClick} disabled={btn.disabled}>
            {btn.text}
          </button>
        ))}
      </div>
    )
  }
})

describe('PreviewSection Component - Error Handling', () => {
  const mockPreviewRows = [
    {
      type: 'bullish',
      text: 'SMA(20) > PDH',
      emoji: '🐂',
      completed: true
    }
  ]

  const mockFormulaState = {
    completedFormulas: {
      bullish: {
        biasType: 'bullish',
        timeframe: '1H',
        indicator1: 'SMA',
        indicator1Param: 20,
        operator: '>',
        indicator2: 'PDH',
        indicator2Param: null
      }
    },
    currentFormula: null,
    currentBiasType: null
  }

  const defaultProps = {
    chartData: [],
    datasetId: 123,
    displayState: {
      displayFormulas: {
        bullish: true,
        neutral: false,
        bearish: true
      }
    },
    handleDisplayToggle: jest.fn(),
    isNeutralFormulaIncluded: false,
    previewRows: mockPreviewRows,
    statusMessage: 'Ready to test',
    formulaVisibility: {
      bullish: true,
      neutral: false,
      bearish: true
    },
    onFormulaVisibilityToggle: jest.fn(),
    isMinimized: false,
    showNorthStar: false,
    onToggleNorthStar: jest.fn(),
    biasDefinition: '',
    onBiasDefinitionChange: jest.fn(),
    formulaState: mockFormulaState,
    hasFormulaChanges: jest.fn(() => false),
    handleFinishFormula: jest.fn()
  }

  // Mock window.api
  const mockBiasTestCondition = jest.fn()
  global.window.api = {
    biasTestCondition: mockBiasTestCondition
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('sanitizeErrorMessage Helper', () => {
    it('sanitizes technical parquet file errors', async () => {
      mockBiasTestCondition.mockResolvedValue({
        success: false,
        message: 'IO Error: No files found that match the pattern "/path/to/dataset.parquet"'
      })

      render(<PreviewSection {...defaultProps} />)

      const testButton = screen.getByText('▶️ Test Sample')
      fireEvent.click(testButton)

      await waitFor(() => {
        expect(
          screen.getByText(
            'Error: Data file is missing or corrupted. Please delete and re-upload the dataset, then try again.'
          )
        ).toBeInTheDocument()
      })
    })

    it('sanitizes technical database errors', async () => {
      mockBiasTestCondition.mockResolvedValue({
        success: false,
        message: 'DuckDB error: Connection failed'
      })

      render(<PreviewSection {...defaultProps} />)

      const testButton = screen.getByText('▶️ Test Sample')
      fireEvent.click(testButton)

      await waitFor(() => {
        expect(
          screen.getByText('Database error. Please restart the application and try again.')
        ).toBeInTheDocument()
      })
    })

    it('passes through clear backend error messages as-is', async () => {
      const clearBackendMessage = 'Invalid 2-formula configuration: Neither condition was met.'

      mockBiasTestCondition.mockResolvedValue({
        success: false,
        message: clearBackendMessage
      })

      render(<PreviewSection {...defaultProps} />)

      const testButton = screen.getByText('▶️ Test Sample')
      fireEvent.click(testButton)

      await waitFor(() => {
        expect(screen.getByText(clearBackendMessage)).toBeInTheDocument()
      })
    })

    it('passes through dataset not found errors from backend', async () => {
      mockBiasTestCondition.mockResolvedValue({
        success: false,
        message: 'Dataset with ID 123 not found'
      })

      render(<PreviewSection {...defaultProps} />)

      const testButton = screen.getByText('▶️ Test Sample')
      fireEvent.click(testButton)

      await waitFor(() => {
        expect(screen.getByText('Dataset with ID 123 not found')).toBeInTheDocument()
      })
    })

    it('passes through timeframe errors from backend', async () => {
      mockBiasTestCondition.mockResolvedValue({
        success: false,
        message: 'All formulas must use the same timeframe'
      })

      render(<PreviewSection {...defaultProps} />)

      const testButton = screen.getByText('▶️ Test Sample')
      fireEvent.click(testButton)

      await waitFor(() => {
        expect(screen.getByText('All formulas must use the same timeframe')).toBeInTheDocument()
      })
    })
  })

  describe('Response Validation', () => {
    it('shows error when response is null/undefined', async () => {
      mockBiasTestCondition.mockResolvedValue(null)

      render(<PreviewSection {...defaultProps} />)

      const testButton = screen.getByText('▶️ Test Sample')
      fireEvent.click(testButton)

      await waitFor(() => {
        expect(
          screen.getByText('No response received from backend. Please try again.')
        ).toBeInTheDocument()
      })
    })

    it('shows error when results array is missing', async () => {
      mockBiasTestCondition.mockResolvedValue({
        success: true,
        metrics: { totalPredictions: 0, correctCount: 0, accuracyPercentage: 0 }
        // No results array
      })

      render(<PreviewSection {...defaultProps} />)

      const testButton = screen.getByText('▶️ Test Sample')
      fireEvent.click(testButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid response: missing results data.')).toBeInTheDocument()
      })
    })

    it('shows error when results array is empty', async () => {
      mockBiasTestCondition.mockResolvedValue({
        success: true,
        results: [],
        metrics: { totalPredictions: 0, correctCount: 0, accuracyPercentage: 0 }
      })

      render(<PreviewSection {...defaultProps} />)

      const testButton = screen.getByText('▶️ Test Sample')
      fireEvent.click(testButton)

      await waitFor(() => {
        expect(
          screen.getByText(
            /No predictions found\. Your formulas may not match any candles in this dataset/
          )
        ).toBeInTheDocument()
      })
    })

    it('shows error when metrics object is missing', async () => {
      mockBiasTestCondition.mockResolvedValue({
        success: true,
        results: [{ timestamp: 123, predictedBias: 'bullish' }]
        // No metrics object
      })

      render(<PreviewSection {...defaultProps} />)

      const testButton = screen.getByText('▶️ Test Sample')
      fireEvent.click(testButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid response: missing metrics data.')).toBeInTheDocument()
      })
    })
  })

  describe('Error Display in Full-Screen View', () => {
    it('displays error banner in full-screen view', async () => {
      mockBiasTestCondition.mockResolvedValue({
        success: false,
        message: 'Test error message'
      })

      render(<PreviewSection {...defaultProps} isMinimized={false} />)

      const testButton = screen.getByText('▶️ Test Sample')
      fireEvent.click(testButton)

      await waitFor(() => {
        const errorBanner = document.querySelector('.preview-error')
        expect(errorBanner).toBeInTheDocument()
        expect(screen.getByText('⚠️')).toBeInTheDocument()
      })
    })

    it('allows dismissing error banner', async () => {
      mockBiasTestCondition.mockResolvedValue({
        success: false,
        message: 'Test error'
      })

      render(<PreviewSection {...defaultProps} />)

      const testButton = screen.getByText('▶️ Test Sample')
      fireEvent.click(testButton)

      await waitFor(() => {
        expect(document.querySelector('.preview-error')).toBeInTheDocument()
      })

      const dismissButton = screen.getByText('×')
      fireEvent.click(dismissButton)

      expect(document.querySelector('.preview-error')).not.toBeInTheDocument()
    })
  })

  describe('Error Display in Minimized View', () => {
    it('displays error in status message area in minimized view', async () => {
      const errorMessage = 'Dataset with ID 123 not found'

      mockBiasTestCondition.mockResolvedValue({
        success: false,
        message: errorMessage
      })

      render(<PreviewSection {...defaultProps} isMinimized={true} />)

      const testButton = screen.getByText('Test')
      fireEvent.click(testButton)

      await waitFor(() => {
        const statusMessage = document.querySelector('.mini-status-message.error')
        expect(statusMessage).toBeInTheDocument()
        expect(statusMessage).toHaveTextContent(errorMessage)
      })
    })

    it('adds title attribute for long error messages in minimized view', async () => {
      const longError =
        'Error: Data file is missing or corrupted. Please delete and re-upload the dataset, then try again.'

      mockBiasTestCondition.mockResolvedValue({
        success: false,
        message: 'No files found that match the pattern'
      })

      render(<PreviewSection {...defaultProps} isMinimized={true} />)

      const testButton = screen.getByText('Test')
      fireEvent.click(testButton)

      await waitFor(() => {
        const statusMessage = document.querySelector('.mini-status-message')
        expect(statusMessage).toHaveAttribute('title', longError)
      })
    })

    it('applies error styling to status message in minimized view', async () => {
      mockBiasTestCondition.mockResolvedValue({
        success: false,
        message: 'Test error'
      })

      render(<PreviewSection {...defaultProps} isMinimized={true} />)

      const testButton = screen.getByText('Test')
      fireEvent.click(testButton)

      await waitFor(() => {
        const statusMessage = document.querySelector('.mini-status-message')
        expect(statusMessage).toHaveClass('error')
      })
    })
  })

  describe('Error Clearing', () => {
    it('clears previous errors on new test attempt', async () => {
      const errorMessage = 'First error from backend'

      mockBiasTestCondition
        .mockResolvedValueOnce({
          success: false,
          message: errorMessage
        })
        .mockResolvedValueOnce({
          success: true,
          results: [{ timestamp: 123, predictedBias: 'bullish' }],
          metrics: { totalPredictions: 1, correctCount: 1, accuracyPercentage: 100 }
        })

      render(<PreviewSection {...defaultProps} />)

      const testButton = screen.getByText('▶️ Test Sample')

      // First click - error (backend message passed through as-is)
      fireEvent.click(testButton)
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })

      // Second click - success (error should clear)
      fireEvent.click(testButton)
      await waitFor(() => {
        expect(screen.queryByText(errorMessage)).not.toBeInTheDocument()
        expect(screen.getByTestId('test-results-modal')).toBeInTheDocument()
      })
    })
  })

  describe('Successful Test Flow', () => {
    it('opens modal on successful test', async () => {
      mockBiasTestCondition.mockResolvedValue({
        success: true,
        results: [
          {
            timestamp: 123456,
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
      })

      render(<PreviewSection {...defaultProps} />)

      const testButton = screen.getByText('▶️ Test Sample')
      fireEvent.click(testButton)

      await waitFor(() => {
        expect(screen.getByTestId('test-results-modal')).toBeInTheDocument()
      })

      expect(mockBiasTestCondition).toHaveBeenCalledWith({
        formulas: [mockFormulaState.completedFormulas.bullish],
        datasetId: 123,
        timeframe: '1H'
      })
    })

    it('does not show error banner on success', async () => {
      mockBiasTestCondition.mockResolvedValue({
        success: true,
        results: [{ timestamp: 123, predictedBias: 'bullish' }],
        metrics: { totalPredictions: 1, correctCount: 1, accuracyPercentage: 100 }
      })

      render(<PreviewSection {...defaultProps} />)

      const testButton = screen.getByText('▶️ Test Sample')
      fireEvent.click(testButton)

      await waitFor(() => {
        expect(screen.getByTestId('test-results-modal')).toBeInTheDocument()
      })

      expect(document.querySelector('.preview-error')).not.toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('shows loading state during test', async () => {
      mockBiasTestCondition.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      render(<PreviewSection {...defaultProps} />)

      const testButton = screen.getByText('▶️ Test Sample')
      fireEvent.click(testButton)

      expect(screen.getByText('⏳ Testing...')).toBeInTheDocument()
    })

    it('clears loading state after test completes', async () => {
      mockBiasTestCondition.mockResolvedValue({
        success: true,
        results: [{ timestamp: 123, predictedBias: 'bullish' }],
        metrics: { totalPredictions: 1, correctCount: 1, accuracyPercentage: 100 }
      })

      render(<PreviewSection {...defaultProps} />)

      const testButton = screen.getByText('▶️ Test Sample')
      fireEvent.click(testButton)

      await waitFor(() => {
        expect(screen.queryByText('⏳ Testing...')).not.toBeInTheDocument()
      })
    })

    it('clears loading state on error', async () => {
      mockBiasTestCondition.mockResolvedValue({
        success: false,
        message: 'Error'
      })

      render(<PreviewSection {...defaultProps} />)

      const testButton = screen.getByText('▶️ Test Sample')
      fireEvent.click(testButton)

      await waitFor(() => {
        expect(screen.queryByText('⏳ Testing...')).not.toBeInTheDocument()
      })
    })
  })

  describe('Exception Handling', () => {
    it('handles network errors gracefully', async () => {
      mockBiasTestCondition.mockRejectedValue(new Error('Network error'))

      render(<PreviewSection {...defaultProps} />)

      const testButton = screen.getByText('▶️ Test Sample')
      fireEvent.click(testButton)

      await waitFor(() => {
        expect(screen.getByText('Error: Network error')).toBeInTheDocument()
      })
    })

    it('handles errors without message', async () => {
      mockBiasTestCondition.mockRejectedValue(new Error())

      render(<PreviewSection {...defaultProps} />)

      const testButton = screen.getByText('▶️ Test Sample')
      fireEvent.click(testButton)

      await waitFor(() => {
        expect(
          screen.getByText('Error: An unexpected error occurred. Please try again.')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Scan Complete State', () => {
    it('hides action buttons when statusMessage is "Scan Complete!"', () => {
      render(<PreviewSection {...defaultProps} statusMessage="Scan Complete!" />)

      // Action buttons should not be visible
      expect(screen.queryByText('▶️ Test Sample')).not.toBeInTheDocument()
      expect(screen.queryByText('🔍 Run Scan')).not.toBeInTheDocument()
    })

    it('shows action buttons when statusMessage is "Ready to test"', () => {
      render(<PreviewSection {...defaultProps} statusMessage="Ready to test" />)

      // Action buttons should be visible
      expect(screen.getByText('▶️ Test Sample')).toBeInTheDocument()
      expect(screen.getByText('🔍 Run Scan')).toBeInTheDocument()
    })

    it('hides action buttons in minimized view when statusMessage is "Scan Complete!"', () => {
      render(<PreviewSection {...defaultProps} isMinimized={true} statusMessage="Scan Complete!" />)

      // Action buttons should not be visible in minimized view
      expect(screen.queryByText('Test')).not.toBeInTheDocument()
      expect(screen.queryByText('Scan')).not.toBeInTheDocument()
    })

    it('displays "Scan Complete!" in status message area in minimized view', () => {
      render(<PreviewSection {...defaultProps} isMinimized={true} statusMessage="Scan Complete!" />)

      const statusMessage = document.querySelector('.mini-status-message')
      expect(statusMessage).toHaveTextContent('Scan Complete!')
    })
  })

  describe('Status Message Styling by View', () => {
    it('uses mini-status-message class in minimized view', () => {
      render(<PreviewSection {...defaultProps} isMinimized={true} statusMessage="Ready to test" />)

      const statusMessage = document.querySelector('.mini-status-message')
      expect(statusMessage).toBeInTheDocument()
      expect(statusMessage).toHaveTextContent('Ready to test')
    })

    it('does not use mini-status-message class in fullscreen view', () => {
      render(<PreviewSection {...defaultProps} isMinimized={false} statusMessage="Ready to test" />)

      // In fullscreen, status is shown via PreviewText component (status-message class)
      expect(document.querySelector('.mini-status-message')).not.toBeInTheDocument()
    })
  })

  describe('Scan Button Error Handling (handleFullScan)', () => {
    const mockOnRunFullScan = jest.fn()

    const propsWithScan = {
      ...defaultProps,
      onRunFullScan: mockOnRunFullScan,
      formulaState: {
        completedFormulas: {
          bullish: {
            biasType: 'bullish',
            timeframe: '1D',
            indicator1: 'SMA',
            indicator1Param: 20,
            operator: '>',
            indicator2: 'SMA',
            indicator2Param: 50
          },
          bearish: {
            biasType: 'bearish',
            timeframe: '1D',
            indicator1: 'SMA',
            indicator1Param: 20,
            operator: '<=',
            indicator2: 'SMA',
            indicator2Param: 50
          }
        },
        currentFormula: null
      }
    }

    beforeEach(() => {
      mockOnRunFullScan.mockReset()
    })

    it('displays backend error message when scan returns success: false', async () => {
      const errorMessage = 'Failed to run full scan: Invalid 2-formula configuration'
      mockOnRunFullScan.mockResolvedValue({
        success: false,
        message: errorMessage
      })

      render(<PreviewSection {...propsWithScan} />)

      const scanButton = screen.getByText('🔍 Run Scan')
      fireEvent.click(scanButton)

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })

    it('displays error in minimized view when scan fails', async () => {
      const errorMessage = 'Failed to run full scan: Invalid 2-formula configuration'
      mockOnRunFullScan.mockResolvedValue({
        success: false,
        message: errorMessage
      })

      render(<PreviewSection {...propsWithScan} isMinimized={true} />)

      const scanButton = screen.getByText('Scan')
      fireEvent.click(scanButton)

      await waitFor(() => {
        const statusMessage = document.querySelector('.mini-status-message.error')
        expect(statusMessage).toBeInTheDocument()
        expect(statusMessage).toHaveTextContent(errorMessage)
      })
    })

    it('does not open TestResultsModal when scan fails', async () => {
      mockOnRunFullScan.mockResolvedValue({
        success: false,
        message: 'Scan failed'
      })

      render(<PreviewSection {...propsWithScan} />)

      const scanButton = screen.getByText('🔍 Run Scan')
      fireEvent.click(scanButton)

      await waitFor(() => {
        expect(screen.getByText('Scan failed')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('test-results-modal')).not.toBeInTheDocument()
    })

    it('error is displayed instead of statusMessage when scan fails', async () => {
      const errorMessage = 'Formula configuration error'
      mockOnRunFullScan.mockResolvedValue({
        success: false,
        message: errorMessage
      })

      render(<PreviewSection {...propsWithScan} isMinimized={true} />)

      const scanButton = screen.getByText('Scan')
      fireEvent.click(scanButton)

      await waitFor(() => {
        const statusMessage = document.querySelector('.mini-status-message')
        expect(statusMessage).toHaveTextContent(errorMessage)
        expect(statusMessage).not.toHaveTextContent('Ready to test')
      })
    })

    it('clears error on next successful scan', async () => {
      // First scan fails
      mockOnRunFullScan
        .mockResolvedValueOnce({
          success: false,
          message: 'First scan error'
        })
        // Second scan succeeds
        .mockResolvedValueOnce({
          success: true,
          modelId: 1,
          metrics: { totalPredictions: 10, correctCount: 7, accuracyPercentage: 70 },
          predictions: []
        })

      render(<PreviewSection {...propsWithScan} />)

      const scanButton = screen.getByText('🔍 Run Scan')

      // First click - error
      fireEvent.click(scanButton)
      await waitFor(() => {
        expect(screen.getByText('First scan error')).toBeInTheDocument()
      })

      // Second click - success (error should clear)
      fireEvent.click(scanButton)
      await waitFor(() => {
        expect(screen.queryByText('First scan error')).not.toBeInTheDocument()
      })
    })

    it('shows validation error when formulaState has no completed formulas', async () => {
      const propsWithoutFormulas = {
        ...propsWithScan,
        formulaState: {
          completedFormulas: {},
          currentFormula: null
        }
      }

      render(<PreviewSection {...propsWithoutFormulas} />)

      const scanButton = screen.getByText('🔍 Run Scan')
      fireEvent.click(scanButton)

      // When completedFormulas is empty, formulas array is empty,
      // so formulas[0]?.timeframe is undefined, triggering timeframe validation
      await waitFor(() => {
        expect(
          screen.getByText('Formula missing timeframe. Please check your formula configuration.')
        ).toBeInTheDocument()
      })

      expect(mockOnRunFullScan).not.toHaveBeenCalled()
    })

    it('shows unable to scan error when completedFormulas is null', async () => {
      const propsWithNullFormulas = {
        ...propsWithScan,
        formulaState: {
          completedFormulas: null,
          currentFormula: null
        }
      }

      render(<PreviewSection {...propsWithNullFormulas} />)

      const scanButton = screen.getByText('🔍 Run Scan')
      fireEvent.click(scanButton)

      await waitFor(() => {
        expect(
          screen.getByText('Unable to run scan. Please complete at least one formula.')
        ).toBeInTheDocument()
      })

      expect(mockOnRunFullScan).not.toHaveBeenCalled()
    })
  })
})
