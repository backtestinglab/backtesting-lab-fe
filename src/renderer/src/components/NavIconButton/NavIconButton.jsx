import PropTypes from 'prop-types'

/**
 * @description Renders a single navigation icon button for the HUD.
 */

const NavIconButton = ({ segmentKey, icon, onMouseEnter, onMouseLeave }) => {
  const className = `nav-segment-button ${segmentKey.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <div
      className={className}
      onMouseEnter={() => onMouseEnter(segmentKey)}
      onMouseLeave={() => onMouseLeave(segmentKey)}
      role="button"
      tabIndex={0}
      // onFocus={() => handleSegmentHover(key)} // For keyboard navigation to call onMouseEnter/Leave
      // onBlur={handleSegmentLeave} // For keyboard navigation to call onMouseEnter/Leave
    >
      {icon}
    </div>
  )
}

NavIconButton.propTypes = {
  segmentKey: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  onMouseEnter: PropTypes.func.isRequired,
  onMouseLeave: PropTypes.func.isRequired
}

export default NavIconButton
