import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

import ColorPickerPopup from '../ColorPickerPopup/ColorPickerPopup'
import LineThicknessPopup from '../LineThicknessPopup/LineThicknessPopup'
import LineStylePopup from '../LineStylePopup/LineStylePopup'
import { THICKNESS_OPTIONS, LINE_STYLE_OPTIONS } from '../../config/drawingConstants'

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
  onSettingsClick,
  onUpdate,
  toolbarRef
}) => {
  const [showThicknessOptions, setShowThicknessOptions] = useState(false)
  const [showLineStyleOptions, setShowLineStyleOptions] = useState(false)
  const [showColorOptions, setShowColorOptions] = useState(false)
  const [popupPosition, setPopupPosition] = useState('top')
  const [isPopupVisible, setIsPopupVisible] = useState(false)
  const popupRef = useRef(null)
  const thicknessWrapperRef = useRef(null)
  const lineStyleWrapperRef = useRef(null)
  const colorWrapperRef = useRef(null)

  const {
    lineColor = '#2962FF',
    lineWidth = 1,
    lineStyle = 'solid',
    textColor = '#FFFFFF'
  } = drawingState || {}

  useLayoutEffect(() => {
    if (showThicknessOptions || showColorOptions || showLineStyleOptions) {
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
  }, [showColorOptions, showThicknessOptions, showLineStyleOptions])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (thicknessWrapperRef.current && !thicknessWrapperRef.current.contains(event.target)) {
        setShowThicknessOptions(false)
      }

      if (lineStyleWrapperRef.current && !lineStyleWrapperRef.current.contains(event.target)) {
        setShowLineStyleOptions(false)
      }

      if (colorWrapperRef.current && !colorWrapperRef.current.contains(event.target)) {
        setShowColorOptions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleThicknessChange = (newWidth) => {
    onUpdate({ ...drawingState, lineWidth: newWidth })
    setShowThicknessOptions(false)
  }

  const handleLineStyleChange = (newStyle) => {
    onUpdate({ ...drawingState, lineStyle: newStyle })
    setShowLineStyleOptions(false)
  }

  const handleColorChange = (newColor) => {
    onUpdate({ ...drawingState, lineColor: newColor })
    // setShowColorOptions(false)
  }

  const formatStyleName = (style) => {
    if (!style) return ''
    return style.charAt(0).toUpperCase() + style.slice(1)
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
      <div className="toolbar-button-wrapper" ref={colorWrapperRef}>
        <button
          className="toolbar-button color-button"
          onClick={() => setShowColorOptions((prev) => !prev)}
          title="Line Color"
        >
          🎨
          <div className="color-indicator" style={{ backgroundColor: lineColor }}></div>
        </button>
        {showColorOptions && (
          <ColorPickerPopup
            initialColor={lineColor}
            onColorChange={handleColorChange}
            popupPosition={popupPosition}
            popupRef={popupRef}
            popupVisibility={isPopupVisible ? 'visible' : ''}
          />
        )}
      </div>
      <button className="toolbar-button color-button" title="Text Color">
        <span className="text-icon">T</span>
        <div className="color-indicator" style={{ backgroundColor: textColor }}></div>
      </button>
      <div className="toolbar-button-wrapper" ref={thicknessWrapperRef}>
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
          <LineThicknessPopup
            options={THICKNESS_OPTIONS}
            onSelect={handleThicknessChange}
            popupRef={popupRef}
            popupPosition={popupPosition}
            popupVisibility={isPopupVisible ? 'visible' : ''}
          />
        )}
      </div>
      <div className="toolbar-button-wrapper" ref={lineStyleWrapperRef}>
        <button
          className="toolbar-button line-style-button"
          onClick={() => setShowLineStyleOptions((prev) => !prev)}
          title="Line Style"
        >
          <div className={`line-style-preview ${lineStyle}`} style={{ width: '20px' }}></div>
        </button>
        {showLineStyleOptions && (
          <LineStylePopup
            options={LINE_STYLE_OPTIONS}
            onSelect={handleLineStyleChange}
            popupRef={popupRef}
            popupPosition={popupPosition}
            popupVisibility={isPopupVisible ? 'visible' : ''}
          />
        )}
      </div>
      <button title="Settings" onClick={onSettingsClick}>
        ⚙️
      </button>
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
    lineStyle: PropTypes.string,
    textColor: PropTypes.string
  }),
  isDragging: PropTypes.bool,
  onDelete: PropTypes.func.isRequired,
  onDragStart: PropTypes.func.isRequired,
  onSettingsClick: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  toolbarRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) })
}

export default DrawingPropertiesToolbar
