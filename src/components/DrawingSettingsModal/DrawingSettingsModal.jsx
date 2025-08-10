import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import PropTypes from 'prop-types'

import { THICKNESS_OPTIONS, LINE_STYLE_OPTIONS } from '../../config/drawingConstants'
import ColorPickerPopup from '../ColorPickerPopup/ColorPickerPopup'
import LineThicknessPopup from '../LineThicknessPopup/LineThicknessPopup'
import LineStylePopup from '../LineStylePopup/LineStylePopup'

import './DrawingSettingsModal.css'

const DrawingSettingsModal = ({
  drawing,
  onUpdate,
  onClose,
  customStyles,
  isDragging,
  onDragStart,
  modalRef
}) => {
  const [settings, setSettings] = useState(drawing)
  const [activeTab, setActiveTab] = useState('style')
  const [activePopup, setActivePopup] = useState(null) // 'color', 'thickness', 'style'

  const [popupPosition, setPopupPosition] = useState('top')
  const [isPopupVisible, setIsPopupVisible] = useState(false)
  const popupRef = useRef(null)
  const colorWrapperRef = useRef(null)
  const thicknessWrapperRef = useRef(null)
  const lineStyleWrapperRef = useRef(null)
  const modalContentRef = useRef(null)

  const tabs = [
    { id: 'style', label: 'Style' },
    { id: 'text', label: 'Text' },
    { id: 'coords', label: 'Coordinates' }
  ]

  useEffect(() => {
    setSettings(drawing)
  }, [drawing])

  useLayoutEffect(() => {
    if (activePopup) {
      setIsPopupVisible(false)
      requestAnimationFrame(() => {
        if (popupRef.current) {
          const popupRect = popupRef.current.getBoundingClientRect()
          if (popupRect.top < 10) setPopupPosition('bottom')
          else setPopupPosition('top')
          setIsPopupVisible(true)
        }
      })
    } else {
      setIsPopupVisible(false)
      setPopupPosition('top')
    }
  }, [activePopup])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activePopup) {
        const wrappers = {
          color: colorWrapperRef.current,
          thickness: thicknessWrapperRef.current,
          style: lineStyleWrapperRef.current
        }
        const activeWrapper = wrappers[activePopup]
        if (activeWrapper && !activeWrapper.contains(event.target)) {
          setActivePopup(null)
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [activePopup])

  const handleInputChange = (key, value) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    onUpdate(newSettings)
    if (key !== 'lineColor') setActivePopup(null)
  }

  const handleColorSelect = (color) => {
    handleInputChange('lineColor', color)
    setActivePopup(null)
  }

  const handleOk = () => {
    onClose()
  }

  if (!drawing) return null

  const modalClassName = `
    drawing-settings-panel
    ${isDragging ? 'is-dragging' : ''}
  `

  return (
    <div className={modalClassName} style={customStyles} ref={modalRef}>
      <div ref={modalContentRef}>
        <div className="drawing-settings-header" onMouseDown={onDragStart}>
          <h3>Line Settings</h3>
          <button className="drawing-settings-close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="drawing-settings-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`drawing-settings-tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="drawing-settings-body">
          {activeTab === 'style' && (
            <div className="drawing-settings-tab-content">
              {/* Color Control */}
              <div className="drawing-settings-control-row">
                <label>Color</label>
                <div className="control-wrapper" ref={colorWrapperRef}>
                  <button
                    className="control-button color-control-button"
                    onClick={() => setActivePopup(activePopup === 'color' ? null : 'color')}
                  >
                    <div
                      className="control-color-swatch"
                      style={{ backgroundColor: settings.lineColor }}
                    ></div>
                  </button>
                  {activePopup === 'color' && (
                    <ColorPickerPopup
                      initialColor={settings.lineColor}
                      onColorChange={(color) => handleInputChange('lineColor', color)}
                      onColorSelect={handleColorSelect}
                      popupRef={popupRef}
                      popupPosition={popupPosition}
                      popupVisibility={isPopupVisible ? 'visible' : ''}
                    />
                  )}
                </div>
              </div>
              {/* Thickness Control */}
              <div className="drawing-settings-control-row">
                <label>Thickness</label>
                <div className="control-wrapper" ref={thicknessWrapperRef}>
                  <button
                    className="control-button"
                    onClick={() => setActivePopup(activePopup === 'thickness' ? null : 'thickness')}
                  >
                    {settings.lineWidth}px
                  </button>
                  {activePopup === 'thickness' && (
                    <LineThicknessPopup
                      options={THICKNESS_OPTIONS}
                      onSelect={(width) => handleInputChange('lineWidth', width)}
                      popupRef={popupRef}
                      popupPosition={popupPosition}
                      popupVisibility={isPopupVisible ? 'visible' : ''}
                    />
                  )}
                </div>
              </div>
              {/* Line Style Control */}
              <div className="drawing-settings-control-row">
                <label>Line Style</label>
                <div className="control-wrapper" ref={lineStyleWrapperRef}>
                  <button
                    className="control-button style-control-button"
                    onClick={() => setActivePopup(activePopup === 'style' ? null : 'style')}
                  >
                    <div className={`line-style-preview ${settings.lineStyle}`}></div>
                  </button>
                  {activePopup === 'style' && (
                    <LineStylePopup
                      options={LINE_STYLE_OPTIONS}
                      onSelect={(style) => handleInputChange('lineStyle', style)}
                      popupRef={popupRef}
                      popupPosition={popupPosition}
                      popupVisibility={isPopupVisible ? 'visible' : ''}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'text' && (
            <div className="drawing-settings-tab-content">
              <div className="drawing-settings-control-row text-input-row">
                <textarea
                  className="drawing-settings-text-input"
                  placeholder="Enter text..."
                  value={settings.text || ''}
                  onChange={(e) => handleInputChange('text', e.target.value)}
                  rows="3"
                ></textarea>
              </div>
              {/* We will add more text controls here later, like font size and alignment */}
            </div>
          )}
          {activeTab === 'coords' && (
            <div className="drawing-settings-tab-content">
              <p>Coordinate settings will be implemented in a future task.</p>
            </div>
          )}
        </div>

        <div className="drawing-settings-footer">
          <button className="drawing-settings-button-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="drawing-settings-button-save" onClick={handleOk}>
            OK
          </button>
        </div>
      </div>
    </div>
  )
}

DrawingSettingsModal.propTypes = {
  customStyles: PropTypes.object,
  drawing: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    lineColor: PropTypes.string,
    lineWidth: PropTypes.number,
    lineStyle: PropTypes.string,
    textColor: PropTypes.string
  }),
  isDragging: PropTypes.bool,
  modalRef: PropTypes.object,
  onUpdate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onDragStart: PropTypes.func.isRequired
}

export default DrawingSettingsModal
