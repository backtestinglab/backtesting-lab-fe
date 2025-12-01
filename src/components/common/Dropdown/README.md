# Generic Dropdown Component

A reusable dropdown component that provides consistent styling and behavior across the application.

## Features

- Custom popup-style dropdown (no native HTML selects)
- Multiple size variants (mini, default, large)
- Multiple style variants (standard, accent)
- Keyboard navigation support
- Accessibility compliant
- Flexible option data formats
- Click-outside behavior
- Customizable hover styles

## Basic Usage

```jsx
import Dropdown from '../components/common/Dropdown'

// Simple usage with string array
const timeframes = ['1H', '4H', '1D']

<Dropdown
  options={timeframes}
  value={selectedTimeframe}
  onChange={(event) => setSelectedTimeframe(event.target.value)}
  placeholder="Select timeframe"
/>
```

## Option Data Formats

The component accepts multiple option formats and normalizes them internally:

### Simple Arrays

```jsx
// Strings or numbers
const options = ['option1', 'option2', 'option3']
const numbers = [1, 2, 3, 4, 5]
```

### Object Format

```jsx
const options = [
  { value: 'SMA', label: 'Simple Moving Average' },
  { value: 'EMA', label: 'Exponential Moving Average' },
  { value: 'RSI', label: 'Relative Strength Index', disabled: true }
]
```

### Complex Format with Metadata

```jsx
const indicators = [
  {
    value: 'SMA',
    label: 'SMA',
    metadata: {
      configurable: true,
      paramLabel: 'Period',
      defaultValue: 20
    }
  }
]
```

## Props

| Prop          | Type          | Default              | Description                                       |
| ------------- | ------------- | -------------------- | ------------------------------------------------- |
| `options`     | Array         | `[]`                 | Array of options (strings, numbers, or objects)   |
| `value`       | String/Number | `''`                 | Currently selected value                          |
| `onChange`    | Function      | Required             | Callback when selection changes                   |
| `placeholder` | String        | `'Select an option'` | Placeholder text                                  |
| `variant`     | String        | `'standard'`         | Style variant: `'standard'` or `'accent'`         |
| `size`        | String        | `'default'`          | Size variant: `'mini'`, `'default'`, or `'large'` |
| `disabled`    | Boolean       | `false`              | Disable the dropdown                              |
| `className`   | String        | `''`                 | Additional CSS classes                            |
| `hoverStyle`  | String        | `'default'`          | Hover behavior: `'default'` or `'custom'`         |
| `testId`      | String        | `''`                 | Test ID for testing                               |
| `position`    | String        | `'bottom'`           | Popup position: `'top'` or `'bottom'`             |

## Size Variants

### Mini

```jsx
<Dropdown size="mini" options={options} {...props} />
```

Smaller padding and font size. Used in minimized UI sections.

### Default

```jsx
<Dropdown size="default" options={options} {...props} />
```

Standard size for most use cases.

### Large

```jsx
<Dropdown size="large" options={options} {...props} />
```

Larger padding and font size for emphasis.

## Style Variants

### Standard

```jsx
<Dropdown variant="standard" options={options} {...props} />
```

Default dark theme styling.

### Accent

```jsx
<Dropdown variant="accent" options={options} {...props} />
```

Gold/accent theme styling (used for bias dropdowns).

## Usage Examples

### Form Integration

```jsx
import { OPERATOR_OPTIONS } from '../../config/formOptions'

;<Dropdown
  options={OPERATOR_OPTIONS}
  value={formData.operator}
  onChange={(event) => setFormData({ ...formData, operator: event.target.value })}
  placeholder="Select operator"
  variant="standard"
  size="default"
/>
```

### Dynamic Options

```jsx
import { normalizeTimeframeOptions } from '../../config/formOptions'

const timeframeOptions = normalizeTimeframeOptions(dataset.availableTimeframes?.split(','))

<Dropdown
  options={timeframeOptions}
  value={selectedTimeframe}
  onChange={handleTimeframeChange}
  placeholder="Select timeframe"
/>
```

### Bias Selection (Accent Style)

```jsx
import { normalizeBiasOptions } from '../../config/formOptions'
;<Dropdown
  options={normalizeBiasOptions()}
  value={biasType}
  onChange={handleBiasChange}
  placeholder="Select bias"
  variant="accent"
  size="default"
/>
```

### Drawing Tool Options

```jsx
import { FONT_SIZE_OPTIONS_NORMALIZED } from '../../config/drawingConstants'
;<Dropdown
  options={FONT_SIZE_OPTIONS_NORMALIZED}
  value={fontSize}
  onChange={handleFontSizeChange}
  placeholder="Font size"
  size="mini"
  position="top"
/>
```

## Keyboard Navigation

- **Click or Enter**: Open/close dropdown
- **Arrow Up/Down**: Navigate options
- **Enter**: Select focused option
- **Escape**: Close dropdown and return focus

## Accessibility

The component includes proper ARIA attributes:

- `aria-expanded` for dropdown state
- `aria-haspopup="listbox"` for trigger
- `role="listbox"` for dropdown container
- `role="option"` for each option
- `aria-selected` for selection state
- `aria-disabled` for disabled options

## Testing

Run tests with:

```bash
yarn test Dropdown.test.jsx
```

The component includes comprehensive tests for:

- Basic rendering and prop handling
- Option format normalization
- Size and style variants
- User interaction
- Keyboard navigation
- Accessibility
- Performance with large datasets
