import React from 'react'
import PropTypes from 'prop-types'

import './DrawingPropertiesToolbar.css'

/**
 * @description A floating toolbar for editing the properties of a selected drawing.
 */
const DrawingPropertiesToolbar = ({
  customStyles,
  drawingState,
  isDragging,
  onDelete,
  onDragStart,
  toolbarRef
}) => {
  const { lineColor = '#2962FF', lineWidth = 1, textColor = '#FFFFFF' } = drawingState || {}

  const toolbarClassName = `
    drawing-properties-toolbar
    ${isDragging ? 'is-dragging' : ''}
  `

  return (
    <div className={toolbarClassName} style={customStyles} ref={toolbarRef}>
      <div className="toolbar-drag-handle" onMouseDown={onDragStart}>
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
      <button className="toolbar-button color-button" title="Line Color">
        🎨
        <div className="color-indicator" style={{ backgroundColor: lineColor }}></div>
      </button>
      <button className="toolbar-button color-button" title="Text Color">
        <span className="text-icon">T</span>
        <div className="color-indicator" style={{ backgroundColor: textColor }}></div>
      </button>
      <button className="toolbar-button thickness-button" title="Line Thickness">
        <span className="thickness-icon">┉</span>
        <span className="thickness-label">{lineWidth}px</span>
      </button>
      <button title="Line Style">---</button>
      <button title="Settings">⚙️</button>
      <div className="toolbar-separator"></div>
      <button title="Delete" onClick={onDelete}>
        🗑️
      </button>
    </div>
  )
}

DrawingPropertiesToolbar.propTypes = {
  customStyles: PropTypes.shape({
    left: PropTypes.string,
    top: PropTypes.string
  }),
  drawingState: PropTypes.shape({
    lineColor: PropTypes.string,
    lineWidth: PropTypes.number,
    textColor: PropTypes.string
  }),
  isDragging: PropTypes.bool,
  onDelete: PropTypes.func.isRequired,
  onDragStart: PropTypes.func.isRequired,
  toolbarRef: PropTypes.ref
}

export default DrawingPropertiesToolbar
