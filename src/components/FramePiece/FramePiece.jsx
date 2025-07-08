import React from 'react'
import PropTypes from 'prop-types'

import { useHomeScreen } from '../../contexts/HomeScreenContext'

import './FramePiece.css'

/**
 * @function FramePiece
 * @description Renders a single piece of the outer cockpit frame,
 * potentially including integrated navigation buttons.
 * @param {object} props - The component's props.
 * @param {string} props.position - The position identifier.
 * @param {function} [props.onSecondaryNavClick] - Optional click handler for secondary nav.
 */

const FramePiece = ({ position, segment, segmentKey, onSecondaryNavClick }) => {
  const {
    activeNavSegmentKey,
    handleMainNavLinkEnter,
    handleMainNavLinkLeave,
    setupStep,
    startSetupFlow
  } = useHomeScreen()

  const isLockedActive = activeNavSegmentKey === segmentKey
  const isHoverDisabled = !!setupStep

  const buttonClassName = `
    frame-main-nav-icon-button
    ${segmentKey.replace(/\s+/g, '-')}
    ${isLockedActive ? 'locked-active' : ''}
    ${isHoverDisabled ? 'hover-disabled' : ''}
  `

  const isLower = position.startsWith('bottom-')
  const positionClass = `${position}-frame`

  const isBottomLeft = position === 'bottom-left'
  const isBottomRight = position === 'bottom-right'

  let secondaryButtonText = null
  if (isBottomLeft) secondaryButtonText = 'Explore Trading Models'
  if (isBottomRight) secondaryButtonText = 'Studies/Research'

  const IconOutline = segment?.IconOutline
  const IconSolid = segment?.IconSolid

  return (
    <div
      className={`outer-frame-piece ${positionClass} ${isLower ? 'lower-frame' : ''} ${isLockedActive ? 'locked-active' : ''}`}
    >
      <div className="square"></div>
      <div className="invert-circle-container">
        <div className="invert-circle"></div>
      </div>
      <div className="trapezoid"></div>

      {IconOutline && segmentKey && (
        <div
          className={buttonClassName}
          onMouseEnter={() => {
            !isHoverDisabled && handleMainNavLinkEnter(segmentKey, true)
          }}
          onMouseLeave={() => {
            !isHoverDisabled && handleMainNavLinkLeave(segmentKey)
          }}
          onFocus={() => {
            !isHoverDisabled && handleMainNavLinkEnter(segmentKey)
          }}
          onBlur={() => {
            !isHoverDisabled && handleMainNavLinkLeave(segmentKey)
          }}
          onClick={() => startSetupFlow(segmentKey)}
          role="button"
          tabIndex={0}
        >
          <IconOutline className="main-nav-svg-icon-instance icon-outline" />
          <IconSolid className="main-nav-svg-icon-instance icon-solid" />
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
  onSecondaryNavClick: PropTypes.func
}

FramePiece.defaultProps = {
  segment: null,
  segmentKey: null
}

export default FramePiece
