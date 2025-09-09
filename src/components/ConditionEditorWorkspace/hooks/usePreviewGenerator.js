import { useMemo } from 'react'

import { generatePreviewRows } from '../utils/previewUtils'
import { generateStatusMessage } from '../utils/formulaUtils'

const usePreviewGenerator = (formulaState, displayState, isNeutralFormulaIncluded, hasFormulaChanges) => {
  // Generate dynamic preview rows
  const previewRows = useMemo(() => {
    return generatePreviewRows(formulaState, displayState, hasFormulaChanges)
  }, [formulaState, displayState, hasFormulaChanges])

  // Generate status message
  const statusMessage = useMemo(() => {
    return generateStatusMessage(formulaState, isNeutralFormulaIncluded)
  }, [formulaState, isNeutralFormulaIncluded])

  return {
    previewRows,
    statusMessage
  }
}

export default usePreviewGenerator