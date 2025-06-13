import PropTypes from 'prop-types'

/**
 * @function FramePiece
 * @description Renders a single piece of the outer cockpit frame,
 * potentially including integrated navigation buttons.
 * @param {object} props - The component's props.
 * @param {string} props.position - The position identifier.
 * @param {function} [props.onSecondaryNavClick] - Optional click handler for secondary nav.
 */

const FramePiece = ({
  position,
  segmentIcon,
  segmentKey,
  onMainNavLinkHover,
  onMainNavLinkLeave,
  onSecondaryNavClick
}) => {
  const isLower = position.startsWith('bottom-')
  const positionClass = `${position}-frame`

  const isBottomLeft = position === 'bottom-left'
  const isBottomRight = position === 'bottom-right'

  let secondaryButtonText = null
  if (isBottomLeft) secondaryButtonText = 'Explore Trading Models'
  if (isBottomRight) secondaryButtonText = 'Studies/Research'

  return (
    <div className={`outer-frame-piece ${positionClass} ${isLower ? 'lower-frame' : ''}`}>
      <div className="square"></div>
      <div className="invert-circle-container">
        <div className="invert-circle"></div>
      </div>
      <div className="trapezoid"></div>

      {segmentIcon && segmentKey && (
        <div
          className={`frame-main-nav-icon-button ${segmentKey}`}
          onMouseEnter={() => onMainNavLinkHover && onMainNavLinkHover(segmentKey)}
          onMouseLeave={() => onMainNavLinkLeave && onMainNavLinkLeave(segmentKey)}
          role="button"
          tabIndex={0}
        >
          {segmentIcon}
          {/* This is where we'll add CSS for recess/bevel and glow */}
        </div>
      )}

      {(isBottomLeft || isBottomRight) && secondaryButtonText && (
        <button
          className={`frame-integrated-nav-button ${isBottomLeft ? 'left-button' : 'right-button'}`}
          onClick={() => onSecondaryNavClick && onSecondaryNavClick(secondaryButtonText)}
        >
          {secondaryButtonText}
        </button>
      )}
    </div>
  )
}

FramePiece.propTypes = {
  position: PropTypes.oneOf(['top-left', 'top-right', 'bottom-left', 'bottom-right']).isRequired,
  segmentIcon: PropTypes.string,
  segmentKey: PropTypes.string,
  onMainNavLinkHover: PropTypes.func,
  onMainNavLinkLeave: PropTypes.func,
  onSecondaryNavClick: PropTypes.func
}

export default FramePiece
