import React from 'react'
import PropTypes from 'prop-types'
import './ActionButtons.css'

const ActionButtons = ({
  buttons = [],
  size = 'default',
  className = ''
}) => {
  const getButtonClass = (type, size) => {
    const baseClasses = {
      finish: size === 'mini' ? 'mini-finish-button' : 'finish-formula-button',
      test: size === 'mini' ? 'mini-test-button' : 'test-sample-button',
      scan: size === 'mini' ? 'mini-scan-button' : 'run-scan-button'
    }
    return baseClasses[type] || 'action-button'
  }

  const actionButtonsClasses = ['action-buttons', className].filter(Boolean).join(' ')

  return (
    <div className={actionButtonsClasses}>
      {buttons
        .filter((button) => button?.show !== false)
        .map((button, index) => (
          <button
            key={button.type || index}
            className={getButtonClass(button.type, size)}
            onClick={button.onClick}
            disabled={button?.disabled || false}
            title={button?.title || ''}
            type="button"
          >
            {button.text}
          </button>
        ))}
    </div>
  )
}

ActionButtons.propTypes = {
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(['finish', 'test', 'scan']).isRequired,
      text: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      show: PropTypes.bool,
      disabled: PropTypes.bool,
      title: PropTypes.string
    })
  ),
  size: PropTypes.oneOf(['mini', 'default']),
  className: PropTypes.string
}

export default ActionButtons
