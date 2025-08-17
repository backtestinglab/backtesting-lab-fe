import React, { useCallback, useState, useEffect, useLayoutEffect, useRef } from 'react'
import PropTypes from 'prop-types'

import AlignmentPopup from '../AlignmentPopup/AlignmentPopup'
import ColorPickerPopup from '../ColorPickerPopup/ColorPickerPopup'
import FontSizePopup from '../FontSizePopup/FontSizePopup'
import LineThicknessPopup from '../LineThicknessPopup/LineThicknessPopup'
import LineStylePopup from '../LineStylePopup/LineStylePopup'
import PriceInput from '../PriceInput/PriceInput'
import SaveDrawingTemplateModal from '../SaveTemplateModal/SaveTemplateModal'
import TemplatesPopup from '../TemplatesPopup/TemplatesPopup'

import { useDrawingTemplates } from '../../contexts/DrawingTemplatesContext'

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
  dragBoundsRef
}) => {
  const [settings, setSettings] = useState(drawing)
  const [activeTab, setActiveTab] = useState('style')
  const [activePopup, setActivePopup] = useState(null) // 'lineColor', 'thickness', 'style', 'textColor', 'fontSize', 'textAlign', 'textVerticalAlign'
  const [popupPosition, setPopupPosition] = useState('top')
  const [isPopupVisible, setIsPopupVisible] = useState(false)

  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false)
  const [saveModalPosition, setSaveModalPosition] = useState({ x: 0, y: 0 })
  const [isDraggingSaveModal, setIsDraggingSaveModal] = useState(false)
  const saveModalRef = useRef(null)

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

  const { templates, addTemplate, updateTemplate, removeTemplate } = useDrawingTemplates()

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

  const handleOk = () => {
    onClose()
  }

  const openSaveNewTemplateModal = () => {
    if (modalRef.current) {
      const parentRect = modalRef.current.getBoundingClientRect()
      const initialX = parentRect.left + parentRect.width / 2 - 175 // 350 is modal width
      const initialY = parentRect.top + 50
      setSaveModalPosition({ x: initialX, y: initialY })
    }
    setIsSaveTemplateModalOpen(true)
    setIsTemplatesPopupOpen(false)
  }

  const handleSaveTemplate = async (templateName) => {
    const styleSettings = {
      lineColor: settings.lineColor,
      lineWidth: settings.lineWidth,
      lineStyle: settings.lineStyle,
      textColor: settings.textColor,
      fontSize: settings.fontSize,
      fontWeight: settings.fontWeight,
      textAlign: settings.textAlign,
      textVerticalAlign: settings.textVerticalAlign
    }

    const templateData = {
      name: templateName,
      drawing_type: drawing.type,
      settings: styleSettings
    }

    try {
      const result = await window.api.saveDrawingTemplate(templateData)
      if (result.success) {
        const savedTemplate = result.data
        const existingTemplate = templates.find((t) => t.id === savedTemplate.id)
        if (existingTemplate) {
          updateTemplate(savedTemplate)
        } else {
          addTemplate(savedTemplate)
        }
        setIsSaveTemplateModalOpen(false)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Failed to save template:', error)
      // TODO: Show an error notification to the user
    }
  }

  const handleApplyTemplate = (template) => {
    const newSettings = { ...settings, ...template.settings }
    setSettings(newSettings)
    onUpdate(newSettings)
    setIsTemplatesPopupOpen(false)
  }

  const handleSaveModalDragStart = useCallback(
    (event) => {
      event.preventDefault()

      if (!dragBoundsRef.current || !saveModalRef.current) return

      setIsDraggingSaveModal(true)

      const modalElement = saveModalRef.current
      const chartPane = dragBoundsRef.current.querySelector(
        '.tv-lightweight-charts table tr:first-child td:nth-child(2) div:first-child'
      )

      if (!chartPane || !modalElement) {
        console.error('Could not find chart pane element for bounding.')
        return
      }

      const paneRect = chartPane.getBoundingClientRect()
      const chartAreaRect = dragBoundsRef.current.getBoundingClientRect()

      const dragRef = {
        chartAreaRect,
        paneRect,
        initialMouseX: event.clientX,
        initialMouseY: event.clientY,
        initialLeft: modalElement.offsetLeft,
        initialTop: modalElement.offsetTop,
        modalWidth: modalElement.offsetWidth,
        modalHeight: modalElement.offsetHeight
      }

      const handleModalDragMove = (moveEvent) => {
        const {
          chartAreaRect,
          initialMouseX,
          initialMouseY,
          initialLeft,
          initialTop,
          paneRect,
          modalWidth,
          modalHeight
        } = dragRef

        const dx = moveEvent.clientX - initialMouseX
        const dy = moveEvent.clientY - initialMouseY

        let newLeft = initialLeft + dx
        let newTop = initialTop + dy

        const minX = paneRect.left - chartAreaRect.left
        const maxX = paneRect.right - chartAreaRect.left - modalWidth
        const minY = paneRect.top - chartAreaRect.top
        const maxY = paneRect.bottom - chartAreaRect.top - modalHeight

        newLeft = Math.max(minX, Math.min(newLeft, maxX))
        newTop = Math.max(minY, Math.min(newTop, maxY))

        setSaveModalPosition({ x: newLeft, y: newTop })
      }

      const handleModalDragEnd = () => {
        window.removeEventListener('mousemove', handleModalDragMove)
        window.removeEventListener('mouseup', handleModalDragEnd)
        setIsDraggingSaveModal(false)
      }

      window.addEventListener('mousemove', handleModalDragMove)
      window.addEventListener('mouseup', handleModalDragEnd)
    },
    [dragBoundsRef]
  )

  if (!drawing) return null

  const modalClassName = `
    drawing-settings-panel
    ${isDragging ? 'is-dragging' : ''}
  `

  return (
    <>
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
                      onClick={() =>
                        setActivePopup(activePopup === 'lineColor' ? null : 'lineColor')
                      }
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
                      onClick={() =>
                        setActivePopup(activePopup === 'thickness' ? null : 'thickness')
                      }
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
                      onClick={() =>
                        setActivePopup(activePopup === 'textColor' ? null : 'textColor')
                      }
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
                          className={`chevron ${
                            activePopup === 'textVerticalAlign' ? 'up' : 'down'
                          }`}
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
                    popupRef={templatesPopupRef}
                    templates={templates.filter(
                      (template) => template.drawing_type === drawing.type
                    )}
                    onApply={handleApplyTemplate}
                    onSave={openSaveNewTemplateModal}
                  />
                )}
              </div>
            </div>
            <div className="drawing-settings-footer-right">
              <button className="drawing-settings-button-cancel" onClick={onClose}>
                Cancel
              </button>
              <button className="drawing-settings-button-save" onClick={handleOk}>
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
      {isSaveTemplateModalOpen && (
        <SaveDrawingTemplateModal
          onSave={handleSaveTemplate}
          onClose={() => setIsSaveTemplateModalOpen(false)}
          modalRef={saveModalRef}
          customStyles={{
            left: `${saveModalPosition.x}px`,
            top: `${saveModalPosition.y}px`
          }}
          onDragStart={handleSaveModalDragStart}
          isDragging={isDraggingSaveModal}
        />
      )}
    </>
  )
}

DrawingSettingsModal.propTypes = {
  customStyles: PropTypes.object,
  dragBoundsRef: PropTypes.object,
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
  onUpdate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onDragStart: PropTypes.func.isRequired
}

export default DrawingSettingsModal
