import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import './DrawingSettingsModal.css'

const DrawingSettingsModal = ({
  drawing,
  onSave,
  onClose,
  customStyles,
  isDragging,
  onDragStart,
  modalRef
}) => {
  const [settings, setSettings] = useState(drawing)
  const [activeTab, setActiveTab] = useState('style')

  useEffect(() => {
    setSettings(drawing)
  }, [drawing])

  const handleInputChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    onSave(settings)
  }

  if (!drawing) return null

  const modalClassName = `
    drawing-settings-panel
    ${isDragging ? 'is-dragging' : ''}
  `

  return (
    <div className={modalClassName} style={customStyles} ref={modalRef}>
      <div className="drawing-settings-header" onMouseDown={onDragStart}>
        <h3>Line Settings</h3>
        <button className="drawing-settings-close-button" onClick={onClose}>
          &times;
        </button>
      </div>

      <div className="drawing-settings-tabs">
        <button
          className={`drawing-settings-tab-button ${activeTab === 'style' ? 'active' : ''}`}
          onClick={() => setActiveTab('style')}
        >
          Style
        </button>
        <button
          className={`drawing-settings-tab-button ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => setActiveTab('text')}
        >
          Text
        </button>
        <button
          className={`drawing-settings-tab-button ${activeTab === 'coords' ? 'active' : ''}`}
          onClick={() => setActiveTab('coords')}
        >
          Coordinates
        </button>
      </div>

      <div className="drawing-settings-body">
        {activeTab === 'style' && (
          <div className="drawing-settings-tab-content">
            <div className="drawing-settings-control-row">
              <label htmlFor="lineColor">Color</label>
              <input
                type="color"
                id="lineColor"
                value={settings.lineColor || '#ffffff'}
                onChange={(e) => handleInputChange('lineColor', e.target.value)}
              />
            </div>
            <div className="drawing-settings-control-row">
              <label htmlFor="lineWidth">Thickness</label>
              <select
                id="lineWidth"
                value={settings.lineWidth}
                onChange={(e) => handleInputChange('lineWidth', parseInt(e.target.value, 10))}
              >
                <option value="1">1px</option>
                <option value="2">2px</option>
                <option value="3">3px</option>
                <option value="4">4px</option>
                <option value="5">5px</option>
              </select>
            </div>
            <div className="drawing-settings-control-row">
              <label htmlFor="lineStyle">Style</label>
              <select
                id="lineStyle"
                value={settings.lineStyle}
                onChange={(e) => handleInputChange('lineStyle', e.target.value)}
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </div>
          </div>
        )}
        {activeTab === 'text' && (
          <div className="drawing-settings-tab-content">
            <p>Text settings will be implemented in a future task.</p>
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
        <button className="drawing-settings-button-save" onClick={handleSave}>
          OK
        </button>
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
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onDragStart: PropTypes.func.isRequired
}

export default DrawingSettingsModal
