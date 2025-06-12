import PropTypes from 'prop-types'
import FramePiece from '../FramePiece/FramePiece'

/**
 * @function OuterFrame
 * @description Container for all four pieces of the outer cockpit frame.
 */

const OuterFrame = ({ onSecondaryNavClick }) => {
  return (
    <>
      <FramePiece position="top-left" />
      <FramePiece position="top-right" />
      <FramePiece position="bottom-left" onSecondaryNavClick={onSecondaryNavClick} />
      <FramePiece position="bottom-right" onSecondaryNavClick={onSecondaryNavClick} />
    </>
  )
}

OuterFrame.propTypes = {
  onSecondaryNavClick: PropTypes.func
}

export default OuterFrame
