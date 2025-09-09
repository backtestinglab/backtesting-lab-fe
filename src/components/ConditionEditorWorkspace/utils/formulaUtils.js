export const validateFormula = (formula) => {
  return Object.values(formula).every((value) => value !== '')
}

export const compareFormulas = (formula1, formula2) => {
  if (!formula1 || !formula2) return false
  
  return (
    formula1.timeframe === formula2.timeframe &&
    formula1.indicator1 === formula2.indicator1 &&
    formula1.operator === formula2.operator &&
    formula1.indicator2 === formula2.indicator2
  )
}

export const hasFormulaChanges = (currentFormula, completedFormulas) => {
  const { biasType } = currentFormula

  if (!biasType || !completedFormulas[biasType]) {
    return false
  }

  const completed = completedFormulas[biasType]
  
  return !compareFormulas(currentFormula, completed)
}

export const generateStatusMessage = (formulaState, isNeutralFormulaIncluded) => {
  const completed = Object.values(formulaState.completedFormulas).filter(
    (formula) => formula !== null
  ).length
  
  const requiredBiases = isNeutralFormulaIncluded
    ? ['bullish', 'neutral', 'bearish']
    : ['bullish', 'bearish']
  
  const missing = requiredBiases.filter((bias) => !formulaState.completedFormulas[bias])

  // Don't show status if no formulas started
  if (completed === 0 && !formulaState.currentFormula.biasType) {
    return ''
  }

  // Show current building status
  if (
    formulaState.currentFormula.biasType &&
    !formulaState.completedFormulas[formulaState.currentFormula.biasType]
  ) {
    return `Building ${formulaState.currentFormula.biasType} formula`
  }

  // Show missing formulas
  if (missing.length > 0) {
    return `Missing ${missing.join(' & ')} formula${missing.length > 1 ? 's' : ''}`
  }

  return 'Ready to test'
}

export const shouldShowFinishButton = (currentFormula, completedFormulas, hasChanges) => {
  const allFieldsFilled = validateFormula(currentFormula)
  const isCompleted = completedFormulas[currentFormula.biasType] !== null
  
  return allFieldsFilled && (!isCompleted || hasChanges)
}

export const getFinishButtonText = (hasChanges) => {
  return hasChanges ? 'Update' : 'Finish'
}