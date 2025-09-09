import { useState } from 'react'

import {
  completeFormula,
  createInitialFormulaState,
  handleBiasTypeChange,
  handleFormulaFieldChange
} from '../utils/stateUtils'
import { hasFormulaChanges as checkFormulaChanges } from '../utils/formulaUtils'

const useFormulaManager = (isNeutralFormulaIncluded, onFormulaComplete) => {
  const [formulaState, setFormulaState] = useState(createInitialFormulaState())

  // Check if current formula has changes from completed version
  const hasFormulaChanges = () => {
    return checkFormulaChanges(formulaState.currentFormula, formulaState.completedFormulas)
  }

  // Handle current formula changes
  const handleCurrentFormulaChange = (field, value) => {
    setFormulaState((prev) => {
      if (field === 'biasType') {
        return handleBiasTypeChange(value, prev, isNeutralFormulaIncluded)
      }

      return handleFormulaFieldChange(field, value, prev)
    })
  }

  // Finish/Add formula
  const handleFinishFormula = () => {
    const { biasType } = formulaState.currentFormula

    setFormulaState((prev) => completeFormula(prev))

    // Notify parent that a formula was completed (for display state update)
    if (onFormulaComplete) {
      onFormulaComplete(biasType)
    }
  }

  return {
    formulaState,
    hasFormulaChanges,
    handleCurrentFormulaChange,
    handleFinishFormula
  }
}

export default useFormulaManager
