import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ActionButtons from './ActionButtons'

describe('ActionButtons Component', () => {
  const mockButtons = [
    {
      type: 'finish',
      text: 'Finish Formula',
      onClick: jest.fn(),
      show: true
    },
    {
      type: 'test',
      text: 'Test',
      onClick: jest.fn(),
      show: true
    },
    {
      type: 'scan',
      text: 'Scan',
      onClick: jest.fn(),
      show: false,
      disabled: true
    }
  ]

  const defaultProps = {
    buttons: mockButtons
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<ActionButtons {...defaultProps} />)

      expect(document.querySelector('.action-buttons')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<ActionButtons {...defaultProps} className="custom-class" />)
      expect(document.querySelector('.action-buttons.custom-class')).toBeInTheDocument()
    })
  })

  describe('Button Rendering', () => {
    it('renders visible buttons only', () => {
      render(<ActionButtons {...defaultProps} />)

      expect(screen.getByText('Finish Formula')).toBeInTheDocument()
      expect(screen.getByText('Test')).toBeInTheDocument()
      expect(screen.queryByText('Scan')).not.toBeInTheDocument()
    })

    it('applies correct button classes based on type and size', () => {
      const { rerender } = render(<ActionButtons {...defaultProps} size="default" />)

      expect(screen.getByText('Finish Formula')).toHaveClass('finish-formula-button')
      expect(screen.getByText('Test')).toHaveClass('test-sample-button')

      rerender(<ActionButtons {...defaultProps} size="mini" />)

      expect(screen.getByText('Finish Formula')).toHaveClass('mini-finish-button')
      expect(screen.getByText('Test')).toHaveClass('mini-test-button')
    })

    it('handles unknown button types with fallback class', () => {
      const customButtons = [
        {
          type: 'unknown',
          text: 'Custom Button',
          onClick: jest.fn(),
          show: true
        }
      ]

      render(<ActionButtons buttons={customButtons} />)

      expect(screen.getByText('Custom Button')).toHaveClass('action-button')
    })
  })

  describe('Button Interactions', () => {
    it('calls onClick handlers when buttons are clicked', () => {
      const mockFinishClick = jest.fn()
      const mockTestClick = jest.fn()

      const buttons = [
        {
          type: 'finish',
          text: 'Finish',
          onClick: mockFinishClick,
          show: true
        },
        {
          type: 'test',
          text: 'Test',
          onClick: mockTestClick,
          show: true
        }
      ]

      render(<ActionButtons buttons={buttons} />)

      fireEvent.click(screen.getByText('Finish'))
      fireEvent.click(screen.getByText('Test'))

      expect(mockFinishClick).toHaveBeenCalledTimes(1)
      expect(mockTestClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick for disabled buttons', () => {
      const mockOnClick = jest.fn()

      const buttons = [
        {
          type: 'test',
          text: 'Disabled Test',
          onClick: mockOnClick,
          show: true,
          disabled: true
        }
      ]

      render(<ActionButtons buttons={buttons} />)

      const button = screen.getByText('Disabled Test')
      expect(button).toBeDisabled()

      fireEvent.click(button)
      expect(mockOnClick).not.toHaveBeenCalled()
    })
  })

  describe('Button States', () => {
    it('applies disabled state correctly', () => {
      const buttons = [
        {
          type: 'scan',
          text: 'Disabled Scan',
          onClick: jest.fn(),
          show: true,
          disabled: true
        }
      ]

      render(<ActionButtons buttons={buttons} />)

      const button = screen.getByText('Disabled Scan')
      expect(button).toBeDisabled()
    })

    it('applies title attribute when provided', () => {
      const buttons = [
        {
          type: 'test',
          text: 'Test',
          onClick: jest.fn(),
          show: true,
          title: 'Run test on sample data'
        }
      ]

      render(<ActionButtons buttons={buttons} />)

      expect(screen.getByText('Test')).toHaveAttribute('title', 'Run test on sample data')
    })

    it('applies disabled styling for disabled buttons', () => {
      const buttons = [
        {
          type: 'scan',
          text: 'Scan',
          onClick: jest.fn(),
          show: true,
          disabled: true
        }
      ]

      render(<ActionButtons buttons={buttons} />)

      const button = screen.getByText('Scan')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('run-scan-button')

      const computedStyle = window.getComputedStyle(button)
      expect(computedStyle.cursor).toBe('default')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty buttons array', () => {
      render(<ActionButtons buttons={[]} />)

      expect(document.querySelector('.action-buttons')).toBeInTheDocument()
      expect(document.querySelector('.action-buttons')).toBeEmptyDOMElement()
    })

    it('handles undefined buttons prop', () => {
      render(<ActionButtons />)

      expect(document.querySelector('.action-buttons')).toBeInTheDocument()
      expect(document.querySelector('.action-buttons')).toBeEmptyDOMElement()
    })

    it('filters out buttons without explicit show: true', () => {
      const buttons = [
        {
          type: 'finish',
          text: 'Finish',
          onClick: jest.fn()
        },
        {
          type: 'test',
          text: 'Test',
          onClick: jest.fn(),
          show: true
        }
      ]

      render(<ActionButtons buttons={buttons} />)

      expect(screen.queryByText('Finish')).toBeInTheDocument()
      expect(screen.getByText('Test')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('all buttons have proper button type', () => {
      render(<ActionButtons {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('type', 'button')
      })
    })

    it('disabled buttons are properly marked for screen readers', () => {
      const buttons = [
        {
          type: 'scan',
          text: 'Disabled Scan',
          onClick: jest.fn(),
          show: true,
          disabled: true
        }
      ]

      render(<ActionButtons buttons={buttons} />)

      expect(screen.getByText('Disabled Scan')).toBeDisabled()
    })
  })

  describe('Button Type Mapping', () => {
    it('maps all button types correctly for default size', () => {
      const allTypes = [
        { type: 'finish', expected: 'finish-formula-button' },
        { type: 'test', expected: 'test-sample-button' },
        { type: 'scan', expected: 'run-scan-button' }
      ]

      allTypes.forEach(({ type, expected }) => {
        const buttons = [
          {
            type,
            text: `${type} button`,
            onClick: jest.fn(),
            show: true
          }
        ]

        const { unmount } = render(<ActionButtons buttons={buttons} size="default" />)
        expect(screen.getByText(`${type} button`)).toHaveClass(expected)
        unmount()
      })
    })

    it('maps all button types correctly for mini size', () => {
      const allTypes = [
        { type: 'finish', expected: 'mini-finish-button' },
        { type: 'test', expected: 'mini-test-button' },
        { type: 'scan', expected: 'mini-scan-button' }
      ]

      allTypes.forEach(({ type, expected }) => {
        const buttons = [
          {
            type,
            text: `${type} button`,
            onClick: jest.fn(),
            show: true
          }
        ]

        const { unmount } = render(<ActionButtons buttons={buttons} size="mini" />)
        expect(screen.getByText(`${type} button`)).toHaveClass(expected)
        unmount()
      })
    })
  })
})
