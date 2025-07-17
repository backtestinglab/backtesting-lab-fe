import React from 'react'
import PropTypes from 'prop-types'

import './DrawingToolbar.css'

const DrawingToolbar = ({ activeTool, onToolSelect }) => {
  // Placeholder for tools
  const tools = [
    { id: 'cursor', icon: '🖐️', title: 'Cursor' },
    { id: 'trendline', icon: '📈', title: 'Trend Line' },
    { id: 'horzline', icon: '↔️', title: 'Horizontal Line' }
    // ... add more tools
  ]

  return (
    <div className="drawing-toolbar">
      {tools.map((tool) => (
        <button
          key={tool.id}
          className={`toolbar-button ${activeTool === tool.id ? 'active' : ''}`}
          title={tool.title}
          onClick={() => onToolSelect(tool.id)}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  )
}

DrawingToolbar.propTypes = {
  activeTool: PropTypes.string,
  onToolSelect: PropTypes.func.isRequired
}

export default DrawingToolbar
