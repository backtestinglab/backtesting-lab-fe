import React from 'react'
import PropTypes from 'prop-types'

const ColorPickerIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path
      d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z"
      fill="#ffd0a5"
    />
    <circle cx="6.5" cy="10.5" r="1.8" fill="#ff0000ff" />
    <circle cx="9.5" cy="6.5" r="1.8" fill="#2E8B57" />
    <circle cx="14.5" cy="6.5" r="1.8" fill="#7C2D12" />
    <circle cx="17.5" cy="10.5" r="1.8" fill="#0000ffff" />
  </svg>
)

ColorPickerIcon.propTypes = {
  className: PropTypes.string
}

ColorPickerIcon.defaultProps = {
  className: ''
}

export default ColorPickerIcon
