import React from 'react'
import PropTypes from 'prop-types'

const TemplatesIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path
      d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375v11.25C1.5 18.66 2.34 19.5 3.375 19.5h17.25c1.035 0 1.875-.84 1.875-1.875V6.375c0-1.036-.84-1.875-1.875-1.875H3.375zM4.125 6h15.75c.414 0 .75.336.75.75v11.25a.75.75 0 0 1-.75.75H4.125a.75.75 0 0 1-.75-.75V6.75c0-.414.336-.75.75-.75z"
      fillOpacity=".7"
    />
    <path d="M4.125 3.375A.75.75 0 0 1 3.375 2.625H18a.75.75 0 0 1 0 1.5H4.125a.75.75 0 0 1-.75-.75z" />
  </svg>
)

TemplatesIcon.propTypes = {
  className: PropTypes.string
}

TemplatesIcon.defaultProps = {
  className: ''
}

export default TemplatesIcon
