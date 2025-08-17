import React, { useState } from 'react'
import PropTypes from 'prop-types'

import Icon from '../Icon/Icon'

import './TemplatesPopup.css'

const TemplatesPopup = ({ popupRef, templates, onApply, onSave }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState(null)

  const handleReset = () => {
    // This will be implemented in a future task
    console.log('Reset to original clicked')
  }

  const handleDelete = () => {
    // This will be implemented in a future task
    if (selectedTemplateId) {
      console.log('Delete clicked for template ID:', selectedTemplateId)
    }
  }

  return (
    <div className="templates-popup-panel" ref={popupRef}>
      <div className="templates-popup-header">
        <div className="templates-popup-header-left">
          <Icon icon="save" onClick={onSave} title="Save As New Template" />
          <Icon icon="reset" onClick={handleReset} title="Reset to Original" />
        </div>
        <div className="templates-popup-header-right">
          <Icon
            icon="delete"
            onClick={handleDelete}
            disabled={!selectedTemplateId}
            title="Delete Selected Template"
          />
        </div>
      </div>
      <div className="templates-popup-content">
        <ul className="templates-popup-list">
          {templates.map((template) => (
            <li
              key={template.id}
              className={selectedTemplateId === template.id ? 'selected' : ''}
              onClick={() => setSelectedTemplateId(template.id)}
              onDoubleClick={() => onApply(template)}
            >
              {template.name}
            </li>
          ))}
          {templates.length === 0 && <li className="no-templates">No saved templates.</li>}
        </ul>
      </div>
    </div>
  )
}

TemplatesPopup.propTypes = {
  popupRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) })
  ]).isRequired,
  templates: PropTypes.array.isRequired,
  onApply: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
}

export default TemplatesPopup
