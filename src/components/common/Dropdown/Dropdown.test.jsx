import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Dropdown from './Dropdown'

// Mock data for testing
const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3', disabled: true },
  { value: 'option4', label: 'Option 4', icon: '🔧' }
]

const simpleOptions = ['simple1', 'simple2', 'simple3']

const complexOptions = [
  {
    value: 'SMA',
    label: 'SMA',
    metadata: { configurable: true, defaultValue: 20 }
  },
  {
    value: 'EMA',
    label: 'EMA',
    metadata: { configurable: true, defaultValue: 20 }
  }
]

describe('Dropdown Component', () => {
  const defaultProps = {
    options: mockOptions,
    value: '',
    onChange: jest.fn(),
    placeholder: 'Select an option'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<Dropdown {...defaultProps} />)

      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByText('Select an option')).toBeInTheDocument()
    })

    it('renders with custom placeholder', () => {
      render(
        <Dropdown {...defaultProps} placeholder="Choose wisely" />
      )

      expect(screen.getByText('Choose wisely')).toBeInTheDocument()
    })

    it('displays selected value', () => {
      render(
        <Dropdown {...defaultProps} value="option1" />
      )

      // Check specifically for the trigger text, not the option text
      const trigger = screen.getByRole('button')
      expect(trigger).toHaveTextContent('Option 1')
    })

    it('applies test ID when provided', () => {
      render(
        <Dropdown {...defaultProps} testId="test-dropdown" />
      )

      expect(screen.getByTestId('test-dropdown')).toBeInTheDocument()
    })
  })

  describe('Option Format Normalization', () => {
    it('handles simple string/number arrays', () => {
      render(
        <Dropdown
          {...defaultProps}
          options={simpleOptions}
        />
      )

      fireEvent.click(screen.getByRole('button'))

      expect(screen.getByText('simple1')).toBeInTheDocument()
      expect(screen.getByText('simple2')).toBeInTheDocument()
      expect(screen.getByText('simple3')).toBeInTheDocument()
    })

    it('handles complex option objects', () => {
      render(
        <Dropdown
          {...defaultProps}
          options={complexOptions}
        />
      )

      fireEvent.click(screen.getByRole('button'))

      expect(screen.getByText('SMA')).toBeInTheDocument()
      expect(screen.getByText('EMA')).toBeInTheDocument()
    })

    it('handles mixed option formats', () => {
      const mixedOptions = [
        'string_option',
        42,
        { value: 'object_option', label: 'Object Option' }
      ]

      render(
        <Dropdown
          {...defaultProps}
          options={mixedOptions}
        />
      )

      fireEvent.click(screen.getByRole('button'))

      expect(screen.getByText('string_option')).toBeInTheDocument()
      expect(screen.getByText('42')).toBeInTheDocument()
      expect(screen.getByText('Object Option')).toBeInTheDocument()
    })
  })

  describe('Size Variants', () => {
    it('applies mini size classes', () => {
      render(
        <Dropdown {...defaultProps} size="mini" />
      )

      const trigger = screen.getByRole('button')
      expect(trigger).toHaveClass('variant-mini')
    })

    it('applies default size classes', () => {
      render(
        <Dropdown {...defaultProps} size="default" />
      )

      const trigger = screen.getByRole('button')
      expect(trigger).toHaveClass('variant-default')
    })

    it('applies large size classes', () => {
      render(
        <Dropdown {...defaultProps} size="large" />
      )

      const trigger = screen.getByRole('button')
      expect(trigger).toHaveClass('variant-large')
    })
  })

  describe('Style Variants', () => {
    it('applies standard style classes', () => {
      render(
        <Dropdown {...defaultProps} variant="standard" />
      )

      const trigger = screen.getByRole('button')
      expect(trigger).toHaveClass('style-standard')
    })

    it('applies accent style classes', () => {
      render(
        <Dropdown {...defaultProps} variant="accent" />
      )

      const trigger = screen.getByRole('button')
      expect(trigger).toHaveClass('style-accent')
    })
  })

  describe('Interaction', () => {
    it('opens dropdown when clicked', () => {
      render(<Dropdown {...defaultProps} />)

      const trigger = screen.getByRole('button')
      fireEvent.click(trigger)

      expect(trigger).toHaveClass('open')
      expect(screen.getByRole('listbox')).toHaveClass('visible')
    })

    it('closes dropdown when clicked outside', async () => {
      render(<Dropdown {...defaultProps} />)

      const trigger = screen.getByRole('button')
      fireEvent.click(trigger)

      // Click outside
      fireEvent.mouseDown(document.body)

      await waitFor(() => expect(trigger).not.toHaveClass('open'))
    })

    it('calls onChange when option is selected', () => {
      const mockOnChange = jest.fn()
      render(
        <Dropdown {...defaultProps} onChange={mockOnChange} />
      )

      fireEvent.click(screen.getByRole('button'))
      fireEvent.click(screen.getByText('Option 1'))

      expect(mockOnChange).toHaveBeenCalledWith({
        target: { value: 'option1' }
      })
    })

    it('does not call onChange for disabled options', () => {
      const mockOnChange = jest.fn()
      render(
        <Dropdown {...defaultProps} onChange={mockOnChange} />
      )

      fireEvent.click(screen.getByRole('button'))
      fireEvent.click(screen.getByText('Option 3'))

      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })

  describe('Keyboard Navigation', () => {
    it('opens dropdown with Enter key', () => {
      render(<Dropdown {...defaultProps} />)

      const trigger = screen.getByRole('button')
      trigger.focus()
      fireEvent.keyDown(trigger, { key: 'Enter' })

      expect(trigger).toHaveClass('open')
    })

    it('navigates options with arrow keys', async () => {
      render(<Dropdown {...defaultProps} />)

      fireEvent.click(screen.getByRole('button'))

      // Press arrow down
      fireEvent.keyDown(document, { key: 'ArrowDown' })

      const options = screen.getAllByRole('option')
      await waitFor(() => expect(options[0]).toHaveClass('focused'))
    })

    it('selects option with Enter key', async () => {
      const mockOnChange = jest.fn()
      render(
        <Dropdown {...defaultProps} onChange={mockOnChange} />
      )

      fireEvent.click(screen.getByRole('button'))
      fireEvent.keyDown(document, { key: 'ArrowDown' })
      fireEvent.keyDown(document, { key: 'Enter' })

      await waitFor(() => expect(mockOnChange).toHaveBeenCalledWith({
        target: { value: 'option1' }
      }))
    })

    it('closes dropdown with Escape key', async () => {
      render(<Dropdown {...defaultProps} />)

      const trigger = screen.getByRole('button')
      fireEvent.click(trigger)
      fireEvent.keyDown(document, { key: 'Escape' })

      await waitFor(() => expect(trigger).not.toHaveClass('open'))
    })
  })

  describe('Disabled State', () => {
    it('does not open when disabled', () => {
      render(<Dropdown {...defaultProps} disabled={true} />)

      const trigger = screen.getByRole('button')
      fireEvent.click(trigger)

      expect(trigger).not.toHaveClass('open')
      expect(trigger).toHaveClass('disabled')

      // Verify dropdown options are not rendered when disabled
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument()
    })

    it('does not call onChange when disabled and clicked', () => {
      const mockOnChange = jest.fn()
      render(<Dropdown {...defaultProps} disabled={true} onChange={mockOnChange} />)

      const trigger = screen.getByRole('button')
      fireEvent.click(trigger)

      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('applies disabled attributes', () => {
      render(<Dropdown {...defaultProps} disabled={true} />)

      const trigger = screen.getByRole('button')
      expect(trigger).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<Dropdown {...defaultProps} />)

      const trigger = screen.getByRole('button')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
      expect(trigger).toHaveAttribute('aria-label', 'Select an option')
    })

    it('updates aria-expanded when opened', () => {
      render(<Dropdown {...defaultProps} />)

      const trigger = screen.getByRole('button')
      fireEvent.click(trigger)

      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('has proper option roles and attributes', () => {
      render(<Dropdown {...defaultProps} value="option1" />)

      fireEvent.click(screen.getByRole('button'))

      const options = screen.getAllByRole('option')
      expect(options[0]).toHaveAttribute('aria-selected', 'true')
      expect(options[1]).toHaveAttribute('aria-selected', 'false')
      expect(options[2]).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('Performance', () => {
    it('handles large option lists', () => {
      const largeOptionList = Array.from({ length: 1000 }, (_, i) => ({
        value: `option${i}`,
        label: `Option ${i}`
      }))

      const { container } = render(
        <Dropdown {...defaultProps} options={largeOptionList} />
      )

      fireEvent.click(screen.getByRole('button'))

      expect(container.querySelectorAll('.dropdown-option')).toHaveLength(1000)
    })
  })

  describe('PropTypes Validation', () => {
    // Note: PropTypes validation warnings are shown in console during development
    // These tests verify the component handles edge cases gracefully

    it('handles empty options array', () => {
      render(<Dropdown {...defaultProps} options={[]} />)

      fireEvent.click(screen.getByRole('button'))

      const dropdown = screen.getByRole('listbox')
      expect(dropdown).toBeEmptyDOMElement()
    })

    it('handles null/undefined options gracefully', () => {
      // Component should normalize these to empty arrays
      render(<Dropdown {...defaultProps} options={null} />)

      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })
})