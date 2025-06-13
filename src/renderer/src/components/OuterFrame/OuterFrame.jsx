import PropTypes from 'prop-types'
import FramePiece from '../FramePiece/FramePiece'

/**
 * @function OuterFrame
 * @description Container for all four pieces of the outer cockpit frame.
 */

const OuterFrame = ({
  segmentData,
  onMainNavLinkHover,
  onMainNavLinkLeave,
  onSecondaryNavClick
}) => {
  return (
    <>
      <FramePiece
        position="top-left"
        segmentKey="develop"
        segmentIcon={segmentData?.develop?.icon}
        onMainNavLinkHover={onMainNavLinkHover}
        onMainNavLinkLeave={onMainNavLinkLeave}
      />
      <FramePiece
        position="top-right"
        segmentKey="refine"
        segmentIcon={segmentData?.refine?.icon}
        onMainNavLinkHover={onMainNavLinkHover}
        onMainNavLinkLeave={onMainNavLinkLeave}
      />
      <FramePiece
        position="bottom-left"
        segmentKey="analyze"
        segmentIcon={segmentData?.analyze?.icon}
        onMainNavLinkHover={onMainNavLinkHover}
        onMainNavLinkLeave={onMainNavLinkLeave}
        onSecondaryNavClick={onSecondaryNavClick}
      />
      <FramePiece
        position="bottom-right"
        segmentKey="fine-tune"
        segmentIcon={segmentData?.['fine-tune']?.icon}
        onMainNavLinkHover={onMainNavLinkHover}
        onMainNavLinkLeave={onMainNavLinkLeave}
        onSecondaryNavClick={onSecondaryNavClick}
      />
    </>
  )
}

OuterFrame.propTypes = {
  segmentData: PropTypes.objectOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired
    })
  ).isRequired,
  onMainNavLinkHover: PropTypes.func,
  onMainNavLinkLeave: PropTypes.func,
  onSecondaryNavClick: PropTypes.func
}

export default OuterFrame
