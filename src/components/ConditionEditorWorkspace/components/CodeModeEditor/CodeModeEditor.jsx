import React from 'react'

import './CodeModeEditor.css'

const CodeModeEditor = () => {
  return (
    <div className="code-mode-placeholder">
      <h4>JavaScript Code Mode</h4>
      <p>
        This area will integrate Monaco Editor for advanced users to write custom condition
        logic.
      </p>
      <div className="code-placeholder-content">
        <code>
          {`// Example bias condition logic
function evaluateBiasCondition(candle) {
  const sma20 = calculateSMA(candle, 20)
  const sma50 = calculateSMA(candle, 50)
  
  if (sma20 > sma50) return 'bullish'
  if (sma20 < sma50) return 'bearish'  
  return 'neutral'
}`}
        </code>
      </div>
      <p>
        <em>
          State preservation and form sync will be implemented in future Monaco integration.
        </em>
      </p>
    </div>
  )
}


export default CodeModeEditor