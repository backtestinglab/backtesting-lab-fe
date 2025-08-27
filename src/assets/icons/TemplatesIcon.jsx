import React from 'react'
import PropTypes from 'prop-types'

const TemplatesIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
  >
    {/* Dashed border around grid - breaks at bottom right */}
    <g fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1.5,1">
      {/* Top border */}
      <line x1="3" y1="3" x2="21" y2="3" />
      {/* Right border (stops before bottom right) */}
      <line x1="21" y1="3" x2="21" y2="12" />
      {/* Left border */}
      <line x1="3" y1="3" x2="3" y2="21" />
      {/* Bottom border (stops before bottom right) */}
      <line x1="3" y1="21" x2="12" y2="21" />
    </g>

    {/* Top left: Square */}
    <rect x="5.5" y="5.5" width="4" height="4" rx="0.3" fill="currentColor" />

    {/* Top right: Circle */}
    <circle cx="16.5" cy="7.5" r="2" fill="currentColor" />

    {/* Bottom left: Triangle */}
    <path d="M7.5 18L5.5 14h4z" fill="currentColor" />

    {/* Bottom right: Thin plus sign (different style) */}
    <g fill="none" stroke="currentColor" strokeWidth="1.25">
      <line x1="17" y1="14" x2="17" y2="20" />
      <line x1="14" y1="17" x2="20" y2="17" />
    </g>
  </svg>
)

TemplatesIcon.propTypes = {
  className: PropTypes.string
}

TemplatesIcon.defaultProps = {
  className: ''
}

export default TemplatesIcon
