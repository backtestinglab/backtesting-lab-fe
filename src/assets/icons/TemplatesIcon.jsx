import React from 'react'
import PropTypes from 'prop-types'

const TemplatesIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M7 15h7v2H7zm0-4h10v2H7zm0-4h10v2H7zm12-4h-4.18C14.4,1.84,13.3,1,12,1S9.6,1.84,9.18,3H5c-1.11,0-2,0.9-2,2v14 c0,1.1,0.89,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.11,3,19,3z M12,3c0.55,0,1,0.45,1,1s-0.45,1-1,1s-1-0.45-1-1S11.45,3,12,3z" />
  </svg>
)

TemplatesIcon.propTypes = {
  className: PropTypes.string
}

TemplatesIcon.defaultProps = {
  className: ''
}

export default TemplatesIcon
