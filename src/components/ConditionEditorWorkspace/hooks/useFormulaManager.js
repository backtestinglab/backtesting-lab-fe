import {
  completeFormula,
  handleBiasTypeChange,
  handleFormulaFieldChange
} from '../utils/stateUtils'
import { hasFormulaChanges as checkFormulaChanges } from '../utils/formulaUtils'

/**
 * Hook for managing formula state business logic.
 * State is owned by the parent component and passed in - this hook just manages it.
 *
 * @param {Object} formulaState - The formula state object (owned by parent)
 * @param {Function} setFormulaState - State setter (owned by parent)
 * @param {boolean} isNeutralFormulaIncluded - Whether neutral formula is included
 * @param {Function} onFormulaComplete - Callback when a formula is completed
 */
const useFormulaManager = (formulaState, setFormulaState, isNeutralFormulaIncluded, onFormulaComplete) => {
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

    // Pass isNeutralFormulaIncluded so completeFormula can auto-update inverse formula in 2-formula mode
    setFormulaState((prev) => completeFormula(prev, isNeutralFormulaIncluded))

    // Notify parent that a formula was completed (for display state update)
    if (onFormulaComplete) {
      onFormulaComplete(biasType)
    }
  }

  return {
    hasFormulaChanges,
    handleCurrentFormulaChange,
    handleFinishFormula
  }
}

export default useFormulaManager
