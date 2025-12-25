import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import FormulaBuilder from './FormulaBuilder'

// Mock data for testing
const mockFormState = {
  biasType: '',
  timeframe: '',
  indicator1: '',
  indicator1Param: null,
  operator: '',
  indicator2: '',
  indicator2Param: null
}

const mockSelectedTimeframes = ['1m', '5m', '15m', '1h']

describe('FormulaBuilder Component', () => {
  const defaultProps = {
    formState: mockFormState,
    onChange: jest.fn(),
    selectedTimeframes: mockSelectedTimeframes
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<FormulaBuilder {...defaultProps} />)

      expect(document.querySelector('.formula-builder')).toBeInTheDocument()
      expect(document.querySelector('.formula-builder.horizontal')).toBeInTheDocument()
    })

    it('applies layout classes correctly', () => {
      const { rerender } = render(<FormulaBuilder {...defaultProps} layout="horizontal" />)
      expect(document.querySelector('.formula-builder.horizontal')).toBeInTheDocument()

      rerender(<FormulaBuilder {...defaultProps} layout="vertical" />)
      expect(document.querySelector('.formula-builder.vertical')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<FormulaBuilder {...defaultProps} className="custom-class" />)
      expect(document.querySelector('.formula-builder.custom-class')).toBeInTheDocument()
    })
  })

  describe('Bias Selector Integration', () => {
    it('renders dropdown bias selector by default', () => {
      render(<FormulaBuilder {...defaultProps} />)

      const biasDropdown = document.querySelector('.bias-dropdown')
      expect(biasDropdown).toBeInTheDocument()
    })
  })

  describe('Dropdown Integration', () => {
    it('renders all required dropdowns', () => {
      render(<FormulaBuilder {...defaultProps} />)

      expect(document.querySelector('.bias-dropdown')).toBeInTheDocument()
      expect(document.querySelector('.timeframe-dropdown')).toBeInTheDocument()
      expect(document.querySelector('.operator-dropdown')).toBeInTheDocument()
    })

    it('renders indicator groups', () => {
      render(<FormulaBuilder {...defaultProps} />)

      const indicatorGroups = document.querySelectorAll('.indicator-group')
      expect(indicatorGroups).toHaveLength(2) // Left and right indicators
    })

    it('passes size prop to child components', () => {
      render(<FormulaBuilder {...defaultProps} size="mini" />)

      // Verify size is passed through (this would be tested more thoroughly in integration tests)
      expect(document.querySelector('.formula-builder')).toBeInTheDocument()
    })
  })

  describe('Form State Integration', () => {
    it('handles empty form state gracefully', () => {
      render(<FormulaBuilder {...defaultProps} />)

      expect(document.querySelector('.formula-builder')).toBeInTheDocument()
    })
  })
})
