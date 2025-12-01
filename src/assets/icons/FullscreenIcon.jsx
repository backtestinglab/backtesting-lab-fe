import React from 'react'
import PropTypes from 'prop-types'

const FullscreenIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="square"
  >
    {/* Bottom-left corner bracket */}
    <path d="M 10 21 L 3 21 L 3 14" />

    {/* Top-right corner bracket */}
    <path d="M 14 3 L 21 3 L 21 10" />
  </svg>
)

FullscreenIcon.propTypes = {
  className: PropTypes.string
}

FullscreenIcon.defaultProps = {
  className: ''
}

export default FullscreenIcon
