import React from 'react'
import PropTypes from 'prop-types'

import './GlobalModalStyles.css'
import './ConfirmationModal.css'

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content confirmation-modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="modal-close-button" title="Close">
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <button onClick={onClose} className="modal-button cancel-button">
            Cancel
          </button>
          <button onClick={onConfirm} className="modal-button confirm-button-destructive">
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

ConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
}

export default ConfirmationModal
