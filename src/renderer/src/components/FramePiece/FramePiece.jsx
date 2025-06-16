import { useState } from 'react'
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
  segment,
  segmentKey,
  onMainNavLinkHover,
  onMainNavLinkLeave,
  onSecondaryNavClick
}) => {
  const [isMainIconHovered, setIsMainIconHovered] = useState(false)

  const isLower = position.startsWith('bottom-')
  const positionClass = `${position}-frame`

  const isBottomLeft = position === 'bottom-left'
  const isBottomRight = position === 'bottom-right'

  let secondaryButtonText = null
  if (isBottomLeft) secondaryButtonText = 'Explore Trading Models'
  if (isBottomRight) secondaryButtonText = 'Studies/Research'

  const IconToRender = segment?.IconOutline
    ? isMainIconHovered
      ? segment.IconSolid
      : segment.IconOutline
    : null

  return (
    <div className={`outer-frame-piece ${positionClass} ${isLower ? 'lower-frame' : ''}`}>
      <div className="square"></div>
      <div className="invert-circle-container">
        <div className="invert-circle"></div>
      </div>
      <div className="trapezoid"></div>

      {IconToRender && segmentKey && (
        <div
          className={`frame-main-nav-icon-button ${segmentKey.replace(/\s+/g, '-')}`}
          onMouseEnter={() => {
            setIsMainIconHovered(true)
            if (onMainNavLinkHover) onMainNavLinkHover(segmentKey)
          }}
          onMouseLeave={() => {
            setIsMainIconHovered(false)
            if (onMainNavLinkLeave) onMainNavLinkLeave(segmentKey)
          }}
          role="button"
          tabIndex={0}
        >
          <IconToRender className="main-nav-svg-icon-instance" />
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
  segment: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    IconOutline: PropTypes.elementType.isRequired,
    IconSolid: PropTypes.elementType.isRequired
  }),
  segmentKey: PropTypes.string,
  onMainNavLinkHover: PropTypes.func,
  onMainNavLinkLeave: PropTypes.func,
  onSecondaryNavClick: PropTypes.func
}

FramePiece.defaultProps = {
  segment: null,
  segmentKey: null,
  onMainNavLinkHover: null,
  onMainNavLinkLeave: null
}

export default FramePiece
