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

export const formatBiasText = (biasType) => {
  return biasType.charAt(0).toUpperCase() + biasType.slice(1)
}

export const formatFormulaText = (formula) => {
  const { timeframe, indicator1, operator, indicator2 } = formula
  const parts = []
  
  if (timeframe) parts.push(timeframe)
  if (indicator1) parts.push(indicator1)
  if (operator) parts.push(operator)
  if (indicator2) parts.push(indicator2)

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

export const generatePreviewRows = (formulaState, displayState, hasFormulaChanges) => {
  const rows = []
  const currentlyEditingBias = formulaState.currentFormula.biasType

  // Completed formulas (but skip if currently being edited)
  const biasTypes = ['bullish', 'neutral', 'bearish']
  
  biasTypes.forEach(biasType => {
    const completedFormula = formulaState.completedFormulas[biasType]
    const shouldDisplay = displayState.displayFormulas[biasType]
    const isCurrentlyEditing = currentlyEditingBias === biasType

    if (completedFormula && shouldDisplay && !isCurrentlyEditing) {
      rows.push(createCompletedPreviewRow(completedFormula, biasType))
    }
  })

  // Current formula in progress - show when bias type selected OR when editing
  const currentBias = formulaState.currentFormula.biasType
  if (currentBias && displayState.displayFormulas[currentBias]) {
    const isCompleted = formulaState.completedFormulas[currentBias] !== null
    const hasChanges = hasFormulaChanges()

    rows.push(createCurrentPreviewRow(formulaState.currentFormula, isCompleted, hasChanges))
  }

  return rows
}