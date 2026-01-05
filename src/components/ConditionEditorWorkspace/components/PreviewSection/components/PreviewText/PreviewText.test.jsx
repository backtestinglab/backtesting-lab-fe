import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import PreviewText from './PreviewText'

const mockRows = [
  {
    type: 'bullish',
    text: 'When price is bullish',
    emoji: '🐂',
    completed: true
  },
  {
    type: 'bearish',
    text: 'When price is bearish',
    emoji: '🐻',
    completed: false
  }
]

const mockFormulaVisibility = {
  bullish: true,
  neutral: true,
  bearish: true
}

describe('PreviewText Component', () => {
  const defaultProps = {
    rows: mockRows,
    statusMessage: 'Ready to test',
    onFinishClick: jest.fn(),
    onFormulaVisibilityToggle: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<PreviewText {...defaultProps} />)

      expect(document.querySelector('.preview-text')).toBeInTheDocument()
      expect(document.querySelector('.preview-text.default')).toBeInTheDocument()
    })

    it('applies layout classes correctly', () => {
      const { rerender } = render(<PreviewText {...defaultProps} layout="default" />)
      expect(document.querySelector('.preview-text.default')).toBeInTheDocument()

      rerender(<PreviewText {...defaultProps} layout="compact" />)
      expect(document.querySelector('.preview-text.compact')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<PreviewText {...defaultProps} className="custom-class" />)
      expect(document.querySelector('.preview-text.custom-class')).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('shows empty message when no rows provided', () => {
      render(<PreviewText rows={[]} />)

      expect(screen.getByText('Build your condition to see preview...')).toBeInTheDocument()
      expect(document.querySelector('.preview-empty')).toBeInTheDocument()
    })

    it('shows empty message when rows array is empty', () => {
      render(<PreviewText {...defaultProps} rows={[]} />)

      expect(screen.getByText('Build your condition to see preview...')).toBeInTheDocument()
    })
  })

  describe('Row Rendering', () => {
    it('renders preview rows correctly', () => {
      render(<PreviewText {...defaultProps} />)

      expect(screen.getByText('When price is bullish')).toBeInTheDocument()
      expect(screen.getByText('When price is bearish')).toBeInTheDocument()
      expect(screen.getByText('🐂')).toBeInTheDocument()
      expect(screen.getByText('🐻')).toBeInTheDocument()
    })

    it('applies completed/incomplete classes correctly', () => {
      render(<PreviewText {...defaultProps} />)

      const bullishText = screen.getByText('When price is bullish')
      const bearishText = screen.getByText('When price is bearish')

      expect(bullishText).toHaveClass('completed')
      expect(bearishText).toHaveClass('incomplete')
    })

    it('renders text and emoji separately in default layout', () => {
      render(<PreviewText {...defaultProps} layout="default" />)

      expect(screen.getByText('When price is bullish')).toBeInTheDocument()
      expect(screen.getByText('🐂')).toBeInTheDocument()

      const textElement = screen.getByText('When price is bullish')
      const emojiElement = screen.getByText('🐂')
      expect(textElement).not.toBe(emojiElement)
    })

    it('combines text and emoji in compact layout', () => {
      render(<PreviewText {...defaultProps} layout="compact" />)

      expect(screen.getByText('When price is bullish 🐂')).toBeInTheDocument()
      expect(screen.getByText('When price is bearish 🐻')).toBeInTheDocument()
    })
  })

  describe('Finish Button (Compact Layout Only)', () => {
    it('shows finish button when conditions are met', () => {
      const incompleteLastRow = [
        ...mockRows,
        {
          type: 'neutral',
          text: 'When price is neutral',
          emoji: '⚖️',
          completed: false
        }
      ]

      render(
        <PreviewText
          {...defaultProps}
          rows={incompleteLastRow}
          layout="compact"
          showFinishButton={true}
          finishButtonText="Complete Formula"
        />
      )

      expect(screen.getByText('Complete Formula')).toBeInTheDocument()
    })

    it('does not show finish button when last row is completed', () => {
      const completedRows = [
        {
          type: 'bullish',
          text: 'When price is bullish',
          emoji: '🐂',
          completed: true
        }
      ]

      render(
        <PreviewText
          {...defaultProps}
          rows={completedRows}
          layout="compact"
          showFinishButton={true}
        />
      )

      expect(screen.queryByText('Finish Formula')).not.toBeInTheDocument()
    })

    it('calls onFinishClick when finish button is clicked', () => {
      const mockOnFinishClick = jest.fn()
      const incompleteRows = [
        {
          type: 'bullish',
          text: 'When price is bullish',
          emoji: '🐂',
          completed: false
        }
      ]

      render(
        <PreviewText
          {...defaultProps}
          rows={incompleteRows}
          layout="compact"
          showFinishButton={true}
          onFinishClick={mockOnFinishClick}
        />
      )

      fireEvent.click(screen.getByText('Finish Formula'))
      expect(mockOnFinishClick).toHaveBeenCalledTimes(1)
    })

    it('applies compact layout button class', () => {
      const incompleteRows = [
        {
          type: 'bullish',
          text: 'When price is bullish',
          emoji: '🐂',
          completed: false
        }
      ]

      render(
        <PreviewText
          {...defaultProps}
          rows={incompleteRows}
          showFinishButton={true}
          layout="compact"
        />
      )

      expect(screen.getByText('Finish Formula')).toHaveClass('mini-finish-button')
    })
  })

  describe('Formula Visibility Toggle', () => {
    it('shows visibility toggle for completed formulas in compact layout', () => {
      const completedRows = [
        {
          type: 'bullish',
          text: 'When price is bullish',
          emoji: '🐂',
          completed: true
        }
      ]

      render(
        <PreviewText
          {...defaultProps}
          rows={completedRows}
          layout="compact"
          formulaVisibility={mockFormulaVisibility}
        />
      )

      expect(screen.getByText('👁️')).toBeInTheDocument()
      expect(screen.getByTitle('Hide this completed formula')).toBeInTheDocument()
    })

    it('does not show visibility toggle in default layout', () => {
      const completedRows = [
        {
          type: 'bullish',
          text: 'When price is bullish',
          emoji: '🐂',
          completed: true
        }
      ]

      render(
        <PreviewText
          {...defaultProps}
          rows={completedRows}
          layout="default"
          formulaVisibility={mockFormulaVisibility}
        />
      )

      expect(screen.queryByText('👁️')).not.toBeInTheDocument()
    })

    it('calls onFormulaVisibilityToggle when toggle is clicked', () => {
      const mockToggle = jest.fn()
      const completedRows = [
        {
          type: 'bullish',
          text: 'When price is bullish',
          emoji: '🐂',
          completed: true
        }
      ]

      render(
        <PreviewText
          {...defaultProps}
          rows={completedRows}
          layout="compact"
          formulaVisibility={mockFormulaVisibility}
          onFormulaVisibilityToggle={mockToggle}
        />
      )

      fireEvent.click(screen.getByText('👁️'))
      expect(mockToggle).toHaveBeenCalledWith('bullish')
    })
  })

  describe('Status Message', () => {
    it('displays status message when provided', () => {
      render(<PreviewText {...defaultProps} statusMessage="All formulas completed" />)

      expect(screen.getByText('All formulas completed')).toBeInTheDocument()
    })

    it('applies status-message class regardless of layout', () => {
      render(<PreviewText {...defaultProps} statusMessage="Status" layout="default" />)

      expect(screen.getByText('Status')).toHaveClass('status-message')
    })

    it('does not render status message container when empty', () => {
      render(<PreviewText {...defaultProps} statusMessage="" />)

      expect(document.querySelector('.status-message')).not.toBeInTheDocument()
      expect(document.querySelector('.mini-status-message')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('finish button has proper button type', () => {
      const incompleteRows = [
        {
          type: 'bullish',
          text: 'When price is bullish',
          emoji: '🐂',
          completed: false
        }
      ]

      render(
        <PreviewText
          {...defaultProps}
          rows={incompleteRows}
          layout="compact"
          showFinishButton={true}
        />
      )

      expect(screen.getByText('Finish Formula')).toHaveAttribute('type', 'button')
    })

    it('visibility toggle has proper button type and title', () => {
      const completedRows = [
        {
          type: 'bullish',
          text: 'When price is bullish',
          emoji: '🐂',
          completed: true
        }
      ]

      render(
        <PreviewText
          {...defaultProps}
          rows={completedRows}
          layout="compact"
          formulaVisibility={mockFormulaVisibility}
        />
      )

      const toggleButton = screen.getByText('👁️')
      expect(toggleButton).toHaveAttribute('type', 'button')
      expect(toggleButton).toHaveAttribute('title', 'Hide this completed formula')
    })
  })
})
