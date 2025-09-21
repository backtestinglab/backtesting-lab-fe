// Original array formats (temporary - will be removed after migration to new Dropdown component)
export const THICKNESS_OPTIONS = [1, 2, 3, 4, 5]
export const LINE_STYLE_OPTIONS = ['solid', 'dashed', 'dotted']
export const FONT_SIZE_OPTIONS = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 60, 72]

// Normalized option formats for generic dropdown component
export const THICKNESS_OPTIONS_NORMALIZED = THICKNESS_OPTIONS.map(thickness => ({
  value: thickness,
  label: `${thickness}px`
}))

export const LINE_STYLE_OPTIONS_NORMALIZED = LINE_STYLE_OPTIONS.map(style => ({
  value: style,
  label: style.charAt(0).toUpperCase() + style.slice(1)
}))

export const FONT_SIZE_OPTIONS_NORMALIZED = FONT_SIZE_OPTIONS.map(size => ({
  value: size,
  label: `${size}px`
}))

// Chart alignment options
export const ALIGNMENT_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' }
]

export const VERTICAL_ALIGNMENT_OPTIONS = [
  { value: 'top', label: 'Top' },
  { value: 'middle', label: 'Middle' },
  { value: 'bottom', label: 'Bottom' }
]
