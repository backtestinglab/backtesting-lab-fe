import PropTypes from 'prop-types'

/**
 * @function FramePiece
 * @description Renders a single piece of the outer cockpit frame,
 * potentially including integrated navigation buttons.
 * @param {object} props - The component's props.
 * @param {string} props.position - The position identifier.
 * @param {function} [props.onSecondaryNavClick] - Optional click handler for secondary nav.
 */

const FramePiece = ({ position, onSecondaryNavClick }) => {
  const isLower = position.startsWith('bottom-')
  const positionClass = `${position}-frame`

  const isBottomLeft = position === 'bottom-left'
  const isBottomRight = position === 'bottom-right'

  let buttonText = null
  if (isBottomLeft) buttonText = 'Explore Trading Models'
  if (isBottomRight) buttonText = 'Studies/Research'

  return (
    <div className={`outer-frame-piece ${positionClass} ${isLower ? 'lower-frame' : ''}`}>
      <div className="square"></div>
      <div className="invert-circle-container">
        <div className="invert-circle"></div>
      </div>
      <div className="trapezoid"></div>

      {(isBottomLeft || isBottomRight) && buttonText && (
        <button
          className={`frame-integrated-nav-button ${isBottomLeft ? 'left-button' : 'right-button'}`}
          onClick={() => onSecondaryNavClick && onSecondaryNavClick(buttonText)}
        >
          {buttonText}
        </button>
      )}
    </div>
  )
}

FramePiece.propTypes = {
  position: PropTypes.oneOf(['top-left', 'top-right', 'bottom-left', 'bottom-right']).isRequired,
  onSecondaryNavClick: PropTypes.func
}

export default FramePiece
