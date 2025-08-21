import React from 'react'
import PropTypes from 'prop-types'

const SettingsIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 5.85c-.09.55-.552.95-1.11.95H5.85a1.875 1.875 0 0 0-1.732 3.05l.708.707a1.125 1.125 0 0 0 1.587 0l.707-.707a1.125 1.125 0 0 1 1.587 0l.707.707a1.125 1.125 0 0 0 1.587 0l.707-.707a1.125 1.125 0 0 1 1.587 0l.707.707a1.125 1.125 0 0 0 1.587 0l.708-.707a1.875 1.875 0 0 0-1.732-3.05h-2.09a1.125 1.125 0 0 0-1.11-.95l-.178-2.033A1.875 1.875 0 0 0 12.922 2.25h-1.844zM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5z"
      clipRule="evenodd"
    />
    <path d="M12 21a8.25 8.25 0 1 0 0-16.5 8.25 8.25 0 0 0 0 16.5zm0-1.5a6.75 6.75 0 1 0 0-13.5 6.75 6.75 0 0 0 0 13.5z" />
  </svg>
)

SettingsIcon.propTypes = {
  className: PropTypes.string
}

SettingsIcon.defaultProps = {
  className: ''
}

export default SettingsIcon
