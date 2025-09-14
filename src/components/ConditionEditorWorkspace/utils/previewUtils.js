export const getBiasEmoji = (biasType) => {
  switch (biasType) {
    case 'bullish':
      return '📈'
    case 'neutral':
      return '➡️'
    case 'bearish':
      return '📉'
    default:
      return ''
  }
}

export const isRowVisible = (row, formulaVisibility) => {
  // Always show work-in-progress (incomplete) formulas
  // Handle both 'completed' and 'isCompleted' properties for flexibility
  const isCompleted = row.completed || row.isCompleted
  if (!isCompleted) return true
  
  // For completed formulas, check visibility setting
  return formulaVisibility && formulaVisibility[row.type] !== false
}

export const formatBiasText = (biasType) => {
  return biasType.charAt(0).toUpperCase() + biasType.slice(1)
}

const formatIndicatorWithParam = (indicatorType, param) => {
  if (!indicatorType) return ''
  
  if (param === null || param === undefined) {
    return indicatorType
  }
  
  return `${indicatorType}(${param})`
}

export const formatFormulaText = (formula) => {
  const { timeframe, indicator1, indicator1Param, operator, indicator2, indicator2Param } = formula
  const parts = []
  
  if (timeframe) parts.push(timeframe)
  
  const formattedIndicator1 = formatIndicatorWithParam(indicator1, indicator1Param)
  if (formattedIndicator1) parts.push(formattedIndicator1)
  
  if (operator) parts.push(operator)
  
  const formattedIndicator2 = formatIndicatorWithParam(indicator2, indicator2Param)
  if (formattedIndicator2) parts.push(formattedIndicator2)

  return parts.join(' ')
}

export const createPreviewRowText = (formula, biasType) => {
  const conditionText = formatFormulaText(formula)
  const biasText = formatBiasText(biasType)
  
  if (conditionText) {
    return `"${conditionText} → ${biasText}"`
  }
  
  return `"→ ${biasText}"`
}

export const createCompletedPreviewRow = (formula, biasType) => {
  return {
    text: createPreviewRowText(formula, biasType),
    emoji: getBiasEmoji(biasType),
    type: biasType,
    completed: true
  }
}

export const createCurrentPreviewRow = (currentFormula, isCompleted, hasChanges) => {
  const { biasType } = currentFormula
  const emoji = getBiasEmoji(biasType)
  const showAsCompleted = isCompleted && !hasChanges

  return {
    text: createPreviewRowText(currentFormula, biasType),
    emoji,
    type: biasType,
    completed: showAsCompleted
  }
}

export const generatePreviewRows = (formulaState, displayState, hasFormulaChanges, includeAllCompleted = false) => {
  const rows = []
  const currentlyEditingBias = formulaState.currentFormula.biasType

  // Completed formulas (but skip if currently being edited)
  const biasTypes = ['bullish', 'neutral', 'bearish']
  
  biasTypes.forEach(biasType => {
    const completedFormula = formulaState.completedFormulas[biasType]
    const shouldDisplay = displayState.displayFormulas[biasType]
    const isCurrentlyEditing = currentlyEditingBias === biasType

    // For minimized view, always include completed formulas regardless of display state
    if (completedFormula && !isCurrentlyEditing && (includeAllCompleted || shouldDisplay)) {
      rows.push(createCompletedPreviewRow(completedFormula, biasType))
    }
  })

  // Current formula in progress - show when bias type selected OR when editing
  const currentBias = formulaState.currentFormula.biasType
  if (currentBias && (includeAllCompleted || displayState.displayFormulas[currentBias])) {
    const isCompleted = formulaState.completedFormulas[currentBias] !== null
    const hasChanges = hasFormulaChanges()

    rows.push(createCurrentPreviewRow(formulaState.currentFormula, isCompleted, hasChanges))
  }

  return rows
}