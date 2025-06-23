import PropTypes from 'prop-types'
import FramePiece from '../FramePiece/FramePiece'

/**
 * @function OuterFrame
 * @description Container for all four pieces of the outer cockpit frame.
 */

const OuterFrame = ({
  segmentData,
  onMainNavLinkEnter,
  onMainNavLinkLeave,
  onSecondaryNavClick
}) => {
  const segmentsOrder = ['develop', 'refine', 'analyze', 'fine-tune']
  const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right']

  return (
    <>
      {positions.map((position, index) => {
        const segmentKey = segmentsOrder[index]
        const currentSegmentData = segmentData[segmentKey]
        return (
          <FramePiece
            key={position}
            position={position}
            segment={currentSegmentData}
            segmentKey={segmentKey}
            onMainNavLinkEnter={onMainNavLinkEnter}
            onMainNavLinkLeave={onMainNavLinkLeave}
            onSecondaryNavClick={onSecondaryNavClick}
          />
        )
      })}
    </>
  )
}

OuterFrame.propTypes = {
  segmentData: PropTypes.objectOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      IconOutline: PropTypes.elementType.isRequired,
      IconSolid: PropTypes.elementType.isRequired
    })
  ).isRequired,
  onMainNavLinkEnter: PropTypes.func,
  onMainNavLinkLeave: PropTypes.func,
  onSecondaryNavClick: PropTypes.func
}

export default OuterFrame
