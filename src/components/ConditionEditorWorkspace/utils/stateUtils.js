export const createEmptyFormula = (biasType = '') => {
  return {
    biasType,
    timeframe: '',
    indicator1: '',
    indicator1Param: null,
    operator: '',
    indicator2: '',
    indicator2Param: null
  }
}

export const createInitialFormulaState = () => {
  return {
    currentFormula: createEmptyFormula(),
    completedFormulas: {
      bullish: null,
      neutral: null,
      bearish: null
    }
  }
}

export const flipOperator = (operator) => {
  switch (operator) {
    case '>':
      return '<='
    case '<=':
      return '>'
    case '<':
      return '>='
    case '>=':
      return '<'
    case '=':
      return '!='
    case '!=':
      return '='
    default:
      return operator
  }
}

export const createFlippedFormula = (sourceFormula, targetBiasType) => {
  return {
    biasType: targetBiasType,
    timeframe: sourceFormula.timeframe,
    indicator1: sourceFormula.indicator1,
    indicator1Param: sourceFormula.indicator1Param,
    operator: flipOperator(sourceFormula.operator),
    indicator2: sourceFormula.indicator2,
    indicator2Param: sourceFormula.indicator2Param
  }
}

export const getAutoPopulateFormula = (biasType, completedFormulas, isNeutralFormulaIncluded) => {
  // If neutral is unchecked and we have a bullish formula, auto-populate bearish
  if (biasType === 'bearish' && !isNeutralFormulaIncluded && completedFormulas.bullish) {
    return createFlippedFormula(completedFormulas.bullish, biasType)
  }

  // If neutral is unchecked and we have a bearish formula, auto-populate bullish
  if (biasType === 'bullish' && !isNeutralFormulaIncluded && completedFormulas.bearish) {
    return createFlippedFormula(completedFormulas.bearish, biasType)
  }

  return null
}

export const handleBiasTypeChange = (newBiasType, currentState, isNeutralFormulaIncluded) => {
  if (!newBiasType || newBiasType === currentState.currentFormula.biasType) {
    return {
      ...currentState,
      currentFormula: createEmptyFormula(newBiasType)
    }
  }

  // Check if we have a completed formula for this bias type
  if (currentState.completedFormulas[newBiasType]) {
    return {
      ...currentState,
      currentFormula: {
        ...currentState.completedFormulas[newBiasType],
        biasType: newBiasType
      }
    }
  }

  // Try auto-populate logic
  const autoPopulateFormula = getAutoPopulateFormula(
    newBiasType,
    currentState.completedFormulas,
    isNeutralFormulaIncluded
  )

  if (autoPopulateFormula) {
    return {
      ...currentState,
      currentFormula: autoPopulateFormula
    }
  }

  // Default to empty formula
  return {
    ...currentState,
    currentFormula: createEmptyFormula(newBiasType)
  }
}

export const handleFormulaFieldChange = (field, value, currentState) => {
  return {
    ...currentState,
    currentFormula: {
      ...currentState.currentFormula,
      [field]: value
    }
  }
}

export const completeFormula = (currentState, isNeutralFormulaIncluded = true) => {
  const { biasType } = currentState.currentFormula
  const currentFormula = { ...currentState.currentFormula }

  // Start with the current formula being saved
  const updatedCompletedFormulas = {
    ...currentState.completedFormulas,
    [biasType]: currentFormula
  }

  // In 2-formula mode (no neutral), auto-update the inverse formula to maintain inverse relationship
  if (!isNeutralFormulaIncluded) {
    if (biasType === 'bullish') {
      updatedCompletedFormulas.bearish = createFlippedFormula(currentFormula, 'bearish')
    } else if (biasType === 'bearish') {
      updatedCompletedFormulas.bullish = createFlippedFormula(currentFormula, 'bullish')
    }
  }

  return {
    ...currentState,
    completedFormulas: updatedCompletedFormulas,
    currentFormula: createEmptyFormula()
  }
}
