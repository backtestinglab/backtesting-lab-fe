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
          <button
            key={idx}
            onClick={btn.onClick}
            disabled={btn.disabled}
          >
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
    it('sanitizes missing parquet file errors', async () => {
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

    it('sanitizes dataset not found errors', async () => {
      mockBiasTestCondition.mockResolvedValue({
        success: false,
        message: 'Dataset with ID 123 not found'
      })

      render(<PreviewSection {...defaultProps} />)

      const testButton = screen.getByText('▶️ Test Sample')
      fireEvent.click(testButton)

      await waitFor(() => {
        expect(
          screen.getByText('Dataset not found. Please select a valid dataset and try again.')
        ).toBeInTheDocument()
      })
    })

    it('sanitizes timeframe errors', async () => {
      mockBiasTestCondition.mockResolvedValue({
        success: false,
        message: 'All formulas must use the same timeframe'
      })

      render(<PreviewSection {...defaultProps} />)

      const testButton = screen.getByText('▶️ Test Sample')
      fireEvent.click(testButton)

      await waitFor(() => {
        expect(
          screen.getByText('Timeframe error. Please check your formula configuration and try again.')
        ).toBeInTheDocument()
      })
    })

    it('sanitizes database errors', async () => {
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

    it('provides generic message for unknown errors', async () => {
      mockBiasTestCondition.mockResolvedValue({
        success: false,
        message: 'Some unexpected backend error'
      })

      render(<PreviewSection {...defaultProps} />)

      const testButton = screen.getByText('▶️ Test Sample')
      fireEvent.click(testButton)

      await waitFor(() => {
        expect(
          screen.getByText(
            'An error occurred while testing. Please try again or check your dataset and formulas.'
          )
        ).toBeInTheDocument()
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
      mockBiasTestCondition.mockResolvedValue({
        success: false,
        message: 'Dataset with ID 123 not found'
      })

      render(<PreviewSection {...defaultProps} isMinimized={true} />)

      const testButton = screen.getByText('Test')
      fireEvent.click(testButton)

      await waitFor(() => {
        const statusMessage = document.querySelector('.mini-status-message.error')
        expect(statusMessage).toBeInTheDocument()
        expect(statusMessage).toHaveTextContent('Dataset not found')
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
      mockBiasTestCondition
        .mockResolvedValueOnce({
          success: false,
          message: 'First error'
        })
        .mockResolvedValueOnce({
          success: true,
          results: [{ timestamp: 123, predictedBias: 'bullish' }],
          metrics: { totalPredictions: 1, correctCount: 1, accuracyPercentage: 100 }
        })

      render(<PreviewSection {...defaultProps} />)

      const testButton = screen.getByText('▶️ Test Sample')

      // First click - error
      fireEvent.click(testButton)
      await waitFor(() => {
        expect(
          screen.getByText(
            'An error occurred while testing. Please try again or check your dataset and formulas.'
          )
        ).toBeInTheDocument()
      })

      // Second click - success (error should clear)
      fireEvent.click(testButton)
      await waitFor(() => {
        expect(screen.queryByText(/An error occurred while testing/)).not.toBeInTheDocument()
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
})
