import { useState } from 'react'

const useDisplayControls = () => {
  const [displayState, setDisplayState] = useState({
    displayFormulas: {
      bullish: true,
      neutral: true,
      bearish: true
    }
  })

  // Handle display formula toggle
  const handleDisplayToggle = (biasType) => {
    setDisplayState((prev) => ({
      ...prev,
      displayFormulas: {
        ...prev.displayFormulas,
        [biasType]: !prev.displayFormulas[biasType]
      }
    }))
  }

  return {
    displayState,
    handleDisplayToggle
  }
}

export default useDisplayControls