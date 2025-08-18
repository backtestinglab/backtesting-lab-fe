import React from 'react'
import PropTypes from 'prop-types'

import Icon from '../Icon/Icon'

import './TemplatesPopup.css'

const TemplatesPopup = ({ popupRef, templates, onApply, onSave, onDelete }) => {
  const handleReset = () => {
    // This will be implemented in a future task
    console.log('Reset to original clicked')
  }

  const handleDeleteClick = (event, templateId) => {
    event.stopPropagation()
    onDelete(templateId)
  }

  return (
    <div className="templates-popup-panel" ref={popupRef}>
      <div className="templates-popup-header">
        <Icon icon="save" onClick={onSave} title="Save As New Template" />
        <Icon icon="reset" onClick={handleReset} title="Reset to Original" />
      </div>
      <div className="templates-popup-content">
        <ul className="templates-popup-list">
          {templates.map((template) => (
            <li key={template.id} onClick={() => onApply(template)}>
              <span className="template-name">{template.name}</span>
              <span
                className="delete-icon-wrapper"
                onClick={(event) => handleDeleteClick(event, template.id)}
              >
                <Icon icon="delete" title="Delete Template" />
              </span>
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
  onDelete: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
}

export default TemplatesPopup
