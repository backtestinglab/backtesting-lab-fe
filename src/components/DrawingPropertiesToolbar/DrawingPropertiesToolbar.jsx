import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
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
  onUpdate,
  toolbarRef
}) => {
  const [showThicknessOptions, setShowThicknessOptions] = useState(false)
  const [popupPosition, setPopupPosition] = useState('top')
  const [isPopupVisible, setIsPopupVisible] = useState(false)
  const popupRef = useRef(null)
  const wrapperRef = useRef(null)

  const { lineColor = '#2962FF', lineWidth = 1, textColor = '#FFFFFF' } = drawingState || {}

  useLayoutEffect(() => {
    if (showThicknessOptions) {
      setIsPopupVisible(false)

      requestAnimationFrame(() => {
        if (popupRef.current) {
          const popupRect = popupRef.current.getBoundingClientRect()

          if (popupRect.top < 10) {
            setPopupPosition('bottom')
          } else {
            setPopupPosition('top')
          }
          setIsPopupVisible(true)
        }
      })
    } else {
      setIsPopupVisible(false)
      setPopupPosition('top')
    }
  }, [showThicknessOptions])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowThicknessOptions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const thicknessOptions = [1, 2, 3, 4, 5]

  const handleThicknessChange = (newWidth) => {
    onUpdate({ ...drawingState, lineWidth: newWidth })
    setShowThicknessOptions(false)
  }

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
      <div className="toolbar-button-wrapper" ref={wrapperRef}>
        <button
          className="toolbar-button thickness-button"
          onClick={() => setShowThicknessOptions((prev) => !prev)}
          title="Line Thickness"
        >
          <div
            className="thickness-preview"
            style={{
              height: `${lineWidth}px`,
              width: '20px'
            }}
          ></div>
          <span className="thickness-label">{lineWidth}px</span>
        </button>
        {showThicknessOptions && (
          <div
            className={`toolbar-popup thickness-popup position-${popupPosition} ${isPopupVisible ? 'visible' : ''}`}
            ref={popupRef}
          >
            {thicknessOptions.map((width) => (
              <div
                key={width}
                className="thickness-option"
                onClick={() => handleThicknessChange(width)}
              >
                <span className="thickness-label">{width}px</span>
                <div className="thickness-preview" style={{ height: `${width}px` }}></div>
              </div>
            ))}
          </div>
        )}
      </div>
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
  onUpdate: PropTypes.func.isRequired,
  toolbarRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) })
}

export default DrawingPropertiesToolbar
