import React, { useState } from 'react'
import PropTypes from 'prop-types'

import './SaveTemplateModal.css'

const SaveTemplateModal = ({
  onSave,
  onClose,
  customStyles,
  onDragStart,
  modalRef,
  isDragging
}) => {
  const [name, setName] = useState('')

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim())
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  const isSaveDisabled = name.trim() === ''
  const modalClassName = `
    save-drawing-template-modal-panel
    ${isDragging ? 'is-dragging' : ''}
  `

  return (
    <div className={modalClassName} ref={modalRef} style={customStyles}>
      <div
        className="save-drawing-template-modal-header"
        onMouseDown={onDragStart}
      >
        <h3>Save Drawing Template</h3>
        <button
          className="save-drawing-template-modal-close-button"
          onClick={onClose}
        >
          &times;
        </button>
      </div>
      <div className="save-drawing-template-modal-body">
        <p>Please enter a name for your template.</p>
        <input
          type="text"
          className="save-drawing-template-modal-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., Red Resistance Line"
          autoFocus
        />
      </div>
      <div className="save-drawing-template-modal-footer">
        <button
          className="save-drawing-template-modal-button cancel"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="save-drawing-template-modal-button save"
          onClick={handleSave}
          disabled={isSaveDisabled}
        >
          Save
        </button>
      </div>
    </div>
  )
}

SaveTemplateModal.propTypes = {
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  customStyles: PropTypes.object,
  onDragStart: PropTypes.func,
  modalRef: PropTypes.object,
  isDragging: PropTypes.bool
}

export default SaveTemplateModal
