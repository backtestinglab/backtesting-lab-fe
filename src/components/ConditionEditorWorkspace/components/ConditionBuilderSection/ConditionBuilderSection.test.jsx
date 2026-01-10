import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ConditionBuilderSection from './ConditionBuilderSection'

// Mock data for testing
const mockFormulaState = {
  currentFormula: {
    biasType: '',
    timeframe: '',
    indicator1: '',
    indicator1Param: null,
    operator: '',
    indicator2: '',
    indicator2Param: null
  },
  completedFormulas: {
    bullish: null,
    neutral: null,
    bearish: null
  }
}

const mockDisplayState = {
  displayFormulas: {
    neutral: true
  }
}

const mockSelectedTimeframes = ['1M', '5M', '15M', '1H']

describe('ConditionBuilderSection Component', () => {
  const defaultProps = {
    formulaState: mockFormulaState,
    hasFormulaChanges: jest.fn(),
    handleCurrentFormulaChange: jest.fn(),
    handleFinishFormula: jest.fn(),
    isNeutralFormulaIncluded: false,
    setIsNeutralFormulaIncluded: jest.fn(),
    displayState: mockDisplayState,
    handleDisplayToggle: jest.fn(),
    selectedTimeframes: mockSelectedTimeframes,
    isMinimized: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Minimized Layout - Arrow Bias Selector', () => {
    it('renders arrow bias selector when minimized', () => {
      render(<ConditionBuilderSection {...defaultProps} isMinimized={true} />)

      const biasArrows = document.querySelector('.bias-arrows')
      expect(biasArrows).toBeInTheDocument()

      expect(screen.getByText('↗')).toBeInTheDocument()
      expect(screen.getByText('↘')).toBeInTheDocument()
    })

    it('includes neutral arrow when isNeutralFormulaIncluded is true', () => {
      render(
        <ConditionBuilderSection
          {...defaultProps}
          isMinimized={true}
          isNeutralFormulaIncluded={true}
        />
      )

      expect(screen.getByText('→')).toBeInTheDocument()
    })

    it('excludes neutral arrow when isNeutralFormulaIncluded is false', () => {
      render(
        <ConditionBuilderSection
          {...defaultProps}
          isMinimized={true}
          isNeutralFormulaIncluded={false}
        />
      )

      expect(screen.queryByText('→')).not.toBeInTheDocument()
    })

    it('calls handleCurrentFormulaChange when bias arrow is clicked', () => {
      const mockHandleChange = jest.fn()
      render(
        <ConditionBuilderSection
          {...defaultProps}
          isMinimized={true}
          handleCurrentFormulaChange={mockHandleChange}
        />
      )

      fireEvent.click(screen.getByText('↗'))
      expect(mockHandleChange).toHaveBeenCalledWith('biasType', 'bullish')
    })

    it('applies active class to selected bias arrow', () => {
      const formStateWithBias = {
        ...mockFormulaState,
        currentFormula: {
          ...mockFormulaState.currentFormula,
          biasType: 'bullish'
        }
      }

      render(
        <ConditionBuilderSection
          {...defaultProps}
          formulaState={formStateWithBias}
          isMinimized={true}
        />
      )

      const bullishButton = screen.getByText('↗')
      expect(bullishButton).toHaveClass('active')
    })

    it('bias arrow buttons have proper button type', () => {
      render(<ConditionBuilderSection {...defaultProps} isMinimized={true} />)

      const bullishButton = screen.getByText('↗')
      const bearishButton = screen.getByText('↘')

      expect(bullishButton).toHaveAttribute('type', 'button')
      expect(bearishButton).toHaveAttribute('type', 'button')
    })
  })
})
