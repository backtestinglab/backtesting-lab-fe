import { useMemo } from 'react'

import { generatePreviewRows } from '../utils/previewUtils'
import { generateStatusMessage } from '../utils/formulaUtils'

const usePreviewGenerator = (
  formulaState,
  displayState,
  isNeutralFormulaIncluded,
  hasFormulaChanges,
  viewMode = 'full'
) => {
  // Generate dynamic preview rows based on view mode
  const previewRows = useMemo(() => {
    const includeAllCompleted = viewMode === 'minimized'
    return generatePreviewRows(formulaState, displayState, hasFormulaChanges, includeAllCompleted)
  }, [formulaState, displayState, hasFormulaChanges, viewMode])

  const statusMessage = useMemo(() => {
    return generateStatusMessage(formulaState, isNeutralFormulaIncluded)
  }, [formulaState, isNeutralFormulaIncluded])

  return {
    previewRows,
    statusMessage
  }
}

export default usePreviewGenerator
