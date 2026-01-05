import { useMemo } from 'react'

import { generatePreviewRows } from '../utils/previewUtils'
import { generateStatusMessage } from '../utils/formulaUtils'

const usePreviewGenerator = (
  formulaState,
  displayState,
  isNeutralFormulaIncluded,
  hasFormulaChanges,
  viewMode = 'full',
  scanComplete = false
) => {
  // Generate dynamic preview rows based on view mode
  const previewRows = useMemo(() => {
    const includeAllCompleted = viewMode === 'minimized'
    return generatePreviewRows(formulaState, displayState, hasFormulaChanges, includeAllCompleted)
  }, [formulaState, displayState, hasFormulaChanges, viewMode])

  const statusMessage = useMemo(() => {
    if (scanComplete) {
      return 'Scan Complete!'
    }
    return generateStatusMessage(formulaState, isNeutralFormulaIncluded)
  }, [formulaState, isNeutralFormulaIncluded, scanComplete])

  return {
    previewRows,
    statusMessage
  }
}

export default usePreviewGenerator
