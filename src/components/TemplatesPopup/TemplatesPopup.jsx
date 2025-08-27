import React from 'react'
import PropTypes from 'prop-types'

import Icon from '../Icon/Icon'

import './TemplatesPopup.css'

const TemplatesPopup = ({ onApply, onDelete, onReset, onSave, popupRef, templates }) => {
  const handleDeleteClick = (event, templateId) => {
    event.stopPropagation()
    onDelete(templateId)
  }

  return (
    <div className="templates-popup-panel" ref={popupRef}>
      <div className="templates-popup-header">
        <button className="templates-popup-icon-button" onClick={onSave} title="Save As New Template">
          <Icon icon="save" />
        </button>
        <button className="templates-popup-icon-button" onClick={onReset} title="Reset to Defaults">
          <Icon icon="reset" />
        </button>
      </div>
      <div className="templates-popup-content">
        <ul className="templates-popup-list">
          {templates.map((template) => (
            <li key={template.id} onClick={() => onApply(template)}>
              <span className="template-name">{template.name}</span>
              <button
                className="templates-popup-icon-button delete-icon-button"
                onClick={(event) => handleDeleteClick(event, template.id)}
                title="Delete Template"
              >
                <Icon icon="delete" />
              </button>
            </li>
          ))}
          {templates.length === 0 && <li className="no-templates">No saved templates.</li>}
        </ul>
      </div>
    </div>
  )
}

TemplatesPopup.propTypes = {
  onApply: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  popupRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) })
  ]).isRequired,
  templates: PropTypes.array.isRequired
}

export default TemplatesPopup
