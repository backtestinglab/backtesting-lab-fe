import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import PropTypes from 'prop-types'

import AlignmentPopup from '../AlignmentPopup/AlignmentPopup'
import ColorPickerPopup from '../ColorPickerPopup/ColorPickerPopup'
import FontSizePopup from '../FontSizePopup/FontSizePopup'
import LineThicknessPopup from '../LineThicknessPopup/LineThicknessPopup'
import LineStylePopup from '../LineStylePopup/LineStylePopup'
import PriceInput from '../PriceInput/PriceInput'

import {
  THICKNESS_OPTIONS,
  LINE_STYLE_OPTIONS,
  FONT_SIZE_OPTIONS
} from '../../config/drawingConstants'

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
  const [activePopup, setActivePopup] = useState(null) // 'color', 'thickness', 'style', 'textColor', 'fontSize', 'textAlign', 'textVerticalAlign'

  const [popupPosition, setPopupPosition] = useState('top')
  const [isPopupVisible, setIsPopupVisible] = useState(false)
  const popupRef = useRef(null)
  const colorWrapperRef = useRef(null)
  const thicknessWrapperRef = useRef(null)
  const lineStyleWrapperRef = useRef(null)
  const textColorWrapperRef = useRef(null)
  const fontSizeWrapperRef = useRef(null)
  const textAlignWrapperRef = useRef(null)
  const textVerticalAlignWrapperRef = useRef(null)
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
          fontSize: fontSizeWrapperRef.current,
          style: lineStyleWrapperRef.current,
          textColor: textColorWrapperRef.current,
          textAlign: textAlignWrapperRef.current,
          textVerticalAlign: textVerticalAlignWrapperRef.current,
          thickness: thicknessWrapperRef.current
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
    if (key !== 'lineColor' && key !== 'textColor') setActivePopup(null)
  }

  const handleBoldToggle = () => {
    const newWeight = settings.fontWeight === 'bold' ? 'normal' : 'bold'
    handleInputChange('fontWeight', newWeight)
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
              <div className="drawing-settings-top-controls">
                <div className="control-wrapper" ref={textColorWrapperRef}>
                  <button
                    className="control-button color-control-button"
                    onClick={() => setActivePopup(activePopup === 'textColor' ? null : 'textColor')}
                    title="Text Color"
                  >
                    <div
                      className="control-color-swatch"
                      style={{ backgroundColor: settings.textColor }}
                    ></div>
                  </button>
                  {activePopup === 'textColor' && (
                    <ColorPickerPopup
                      initialColor={settings.textColor}
                      onColorChange={(color) => handleInputChange('textColor', color)}
                      onColorSelect={() => setActivePopup(null)}
                      popupRef={popupRef}
                      popupPosition={popupPosition}
                      popupVisibility={isPopupVisible ? 'visible' : ''}
                    />
                  )}
                </div>
                <div className="control-wrapper" ref={fontSizeWrapperRef}>
                  <button
                    className="control-button font-size-control-button"
                    onClick={() => setActivePopup(activePopup === 'fontSize' ? null : 'fontSize')}
                    title="Font Size"
                  >
                    <span>{settings.fontSize || 24}</span>
                    <span
                      className={`chevron ${activePopup === 'fontSize' ? 'up' : 'down'}`}
                    ></span>
                  </button>
                  {activePopup === 'fontSize' && (
                    <FontSizePopup
                      options={FONT_SIZE_OPTIONS}
                      onSelect={(size) => handleInputChange('fontSize', size)}
                      popupRef={popupRef}
                      popupPosition={popupPosition}
                      popupVisibility={isPopupVisible ? 'visible' : ''}
                    />
                  )}
                </div>
                <button
                  className={`control-button bold-button ${
                    settings.fontWeight === 'bold' ? 'active' : ''
                  }`}
                  onClick={handleBoldToggle}
                  title="Bold"
                >
                  B
                </button>
              </div>
              <div className="drawing-settings-control-row text-input-row">
                <textarea
                  className="drawing-settings-text-input"
                  placeholder="Enter text..."
                  value={settings.text || ''}
                  onChange={(e) => handleInputChange('text', e.target.value)}
                  rows="3"
                ></textarea>
              </div>
              <div className="drawing-settings-control-row">
                <label>Text Align</label>
                <div className="drawing-settings-control-group">
                  {/* Horizontal Align Dropdown */}
                  <div className="control-wrapper" ref={textAlignWrapperRef}>
                    <button
                      className="control-button alignment-control-button"
                      onClick={() =>
                        setActivePopup(activePopup === 'textAlign' ? null : 'textAlign')
                      }
                      title="Horizontal Alignment"
                    >
                      <span>
                        {(settings.textAlign || 'right').charAt(0).toUpperCase() +
                          (settings.textAlign || 'right').slice(1)}
                      </span>
                      <span
                        className={`chevron ${activePopup === 'textAlign' ? 'up' : 'down'}`}
                      ></span>
                    </button>
                    {activePopup === 'textAlign' && (
                      <AlignmentPopup
                        options={['left', 'center', 'right']}
                        onSelect={(align) => handleInputChange('textAlign', align)}
                        popupRef={popupRef}
                        popupPosition={popupPosition}
                        popupVisibility={isPopupVisible ? 'visible' : ''}
                      />
                    )}
                  </div>
                  {/* Vertical Align Dropdown */}
                  <div className="control-wrapper" ref={textVerticalAlignWrapperRef}>
                    <button
                      className="control-button alignment-control-button"
                      onClick={() =>
                        setActivePopup(
                          activePopup === 'textVerticalAlign' ? null : 'textVerticalAlign'
                        )
                      }
                      title="Vertical Alignment"
                    >
                      <span>
                        {(settings.textVerticalAlign || 'top').charAt(0).toUpperCase() +
                          (settings.textVerticalAlign || 'top').slice(1)}
                      </span>
                      <span
                        className={`chevron ${activePopup === 'textVerticalAlign' ? 'up' : 'down'}`}
                      ></span>
                    </button>
                    {activePopup === 'textVerticalAlign' && (
                      <AlignmentPopup
                        options={['top', 'middle', 'bottom']}
                        onSelect={(align) => handleInputChange('textVerticalAlign', align)}
                        popupRef={popupRef}
                        popupPosition={popupPosition}
                        popupVisibility={isPopupVisible ? 'visible' : ''}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'coords' && (
            <div className="drawing-settings-tab-content">
              <div className="drawing-settings-control-row">
                <label>Price</label>
                <PriceInput
                  value={settings.price}
                  onChange={(newPrice) => handleInputChange('price', newPrice)}
                />
              </div>
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
    fontSize: PropTypes.number,
    fontWeight: PropTypes.string,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    lineColor: PropTypes.string,
    price: PropTypes.number,
    lineWidth: PropTypes.number,
    lineStyle: PropTypes.string,
    text: PropTypes.string,
    textAlign: PropTypes.string,
    textColor: PropTypes.string,
    textVerticalAlign: PropTypes.string
  }),
  isDragging: PropTypes.bool,
  modalRef: PropTypes.object,
  onUpdate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onDragStart: PropTypes.func.isRequired
}

export default DrawingSettingsModal
