// Form-specific dropdown options for condition builder and other forms

// Operator options for condition building
export const OPERATOR_OPTIONS = [
  { value: '>', label: 'Greater than' },
  { value: '<', label: 'Less than' },
  { value: '=', label: 'Equals' },
  { value: '>=', label: 'Greater than or equal' },
  { value: '<=', label: 'Less than or equal' },
  { value: '!=', label: 'Not equal to' }
]

// Base indicator types (separate from parameters)
export const INDICATOR_TYPE_OPTIONS = [
  {
    value: 'SMA',
    label: 'SMA',
    metadata: {
      configurable: true,
      paramLabel: 'Period',
      minValue: 1,
      maxValue: 999,
      defaultValue: 20
    }
  },
  {
    value: 'EMA',
    label: 'EMA',
    metadata: {
      configurable: true,
      paramLabel: 'Period',
      minValue: 1,
      maxValue: 999,
      defaultValue: 20
    }
  },
  {
    value: 'RSI',
    label: 'RSI',
    metadata: {
      configurable: true,
      paramLabel: 'Period',
      minValue: 1,
      maxValue: 99,
      defaultValue: 14
    }
  },
  {
    value: 'Close',
    label: 'Close',
    metadata: {
      configurable: false
    }
  },
  {
    value: 'PDH',
    label: 'PDH',
    metadata: {
      configurable: false
    }
  },
  {
    value: 'PDL',
    label: 'PDL',
    metadata: {
      configurable: false
    }
  }
]

// Helper functions for normalizing existing data formats

// Helper to normalize existing bias displayState format
export const normalizeBiasOptions = () => [
  { value: 'bullish', label: 'Bullish' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'bearish', label: 'Bearish' }
]

// Helper for dynamic timeframes (temporary during migration)
export const normalizeTimeframeOptions = (timeframes) => {
  if (!timeframes || !Array.isArray(timeframes)) {
    return []
  }
  return timeframes.map((timeframe) => ({ value: timeframe, label: timeframe }))
}

// Helper to convert existing baseIndicators to normalized format
export const normalizeIndicatorTypes = (baseIndicators) => {
  if (!baseIndicators || typeof baseIndicators !== 'object') {
    return INDICATOR_TYPE_OPTIONS
  }

  return Object.entries(baseIndicators).map(([_key, config]) => ({
    value: config.type,
    label: config.label,
    metadata: {
      configurable: config.configurable,
      paramLabel: config.paramLabel,
      minValue: config.minValue,
      maxValue: config.maxValue,
      defaultValue: config.defaultValue
    }
  }))
}

// Helper to normalize simple arrays to option format
export const normalizeSimpleOptions = (items, labelFormatter = null) => {
  if (!Array.isArray(items)) {
    return []
  }

  return items.map((item) => ({
    value: item,
    label: labelFormatter ? labelFormatter(item) : String(item)
  }))
}
