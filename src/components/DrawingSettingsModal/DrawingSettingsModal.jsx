import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

import AlignmentPopup from '../AlignmentPopup/AlignmentPopup'
import ColorPickerPopup from '../ColorPickerPopup/ColorPickerPopup'
import FontSizePopup from '../FontSizePopup/FontSizePopup'
import LineThicknessPopup from '../LineThicknessPopup/LineThicknessPopup'
import LineStylePopup from '../LineStylePopup/LineStylePopup'
import PriceInput from '../PriceInput/PriceInput'
import TemplatesPopup from '../TemplatesPopup/TemplatesPopup'

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
  modalRef,
  // Templates props
  templates,
  onApplyTemplate,
  onOpenSaveTemplateModal,
  onResetToDefaults,
  onDeleteTemplate
}) => {
  const [settings, setSettings] = useState(drawing)
  const [activeTab, setActiveTab] = useState('style')
  const [activePopup, setActivePopup] = useState(null) // 'lineColor', 'thickness', 'style', 'textColor', 'fontSize', 'textAlign', 'textVerticalAlign'
  const [popupPosition, setPopupPosition] = useState('top')
  const [isPopupVisible, setIsPopupVisible] = useState(false)

  const [isTemplatesPopupOpen, setIsTemplatesPopupOpen] = useState(false)
  const templatesPopupRef = useRef(null)
  const templatesButtonRef = useRef(null)

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
          lineColor: colorWrapperRef.current,
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

      if (
        isTemplatesPopupOpen &&
        templatesPopupRef.current &&
        !templatesPopupRef.current.contains(event.target) &&
        templatesButtonRef.current &&
        !templatesButtonRef.current.contains(event.target)
      ) {
        setIsTemplatesPopupOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [activePopup, isTemplatesPopupOpen])

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

  const handleApplyTemplate = (template) => {
    onApplyTemplate(template)
    setIsTemplatesPopupOpen(false)
  }

  const handleResetToDefaults = () => {
    onResetToDefaults()
    setIsTemplatesPopupOpen(false)
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
                    onClick={() => setActivePopup(activePopup === 'lineColor' ? null : 'lineColor')}
                  >
                    <div
                      className="control-color-swatch"
                      style={{ backgroundColor: settings.lineColor }}
                    ></div>
                  </button>
                  {activePopup === 'lineColor' && (
                    <ColorPickerPopup
                      initialColor={settings.lineColor}
                      onColorChange={(lineColor) => handleInputChange('lineColor', lineColor)}
                      onColorSelect={() => setActivePopup(null)}
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
                      onColorChange={(textColor) => handleInputChange('textColor', textColor)}
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
          <div className="drawing-settings-footer-left">
            <div className="templates-button-wrapper" ref={templatesButtonRef}>
              <button
                className="drawing-settings-button-template"
                onClick={() => setIsTemplatesPopupOpen(!isTemplatesPopupOpen)}
              >
                Templates
                <span className={`chevron ${isTemplatesPopupOpen ? 'up' : 'down'}`}></span>
              </button>
              {isTemplatesPopupOpen && (
                <TemplatesPopup
                  onApply={handleApplyTemplate}
                  onDelete={(templateId) => onDeleteTemplate(templateId)}
                  onOpenSaveModal={() => {
                    onOpenSaveTemplateModal()
                    setIsTemplatesPopupOpen(false)
                  }}
                  onReset={handleResetToDefaults}
                  popupRef={templatesPopupRef}
                  templates={templates}
                />
              )}
            </div>
          </div>
          <div className="drawing-settings-footer-right">
            <button className="drawing-settings-button-cancel" onClick={onClose}>
              Cancel
            </button>
            <button className="drawing-settings-button-save" onClick={onClose}>
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

DrawingSettingsModal.propTypes = {
  customStyles: PropTypes.object,
  drawing: PropTypes.shape({
    type: PropTypes.string.isRequired,
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
  onClose: PropTypes.func.isRequired,
  onDragStart: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  // Templates props
  onApplyTemplate: PropTypes.func,
  onDeleteTemplate: PropTypes.func,
  onResetToDefaults: PropTypes.func,
  onOpenSaveTemplateModal: PropTypes.func,
  templates: PropTypes.array
}

export default DrawingSettingsModal
