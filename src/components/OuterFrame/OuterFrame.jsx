import React from 'react'
import PropTypes from 'prop-types'

import { useHomeScreen } from '../../contexts/HomeScreenContext'

import FramePiece from '../FramePiece/FramePiece'

/**
 * @function OuterFrame
 * @description Container for all four pieces of the outer cockpit frame.
 */

const OuterFrame = ({ onSecondaryNavClick }) => {
  const { segmentData } = useHomeScreen()

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
            onSecondaryNavClick={onSecondaryNavClick}
          />
        )
      })}
    </>
  )
}

OuterFrame.propTypes = {
  onSecondaryNavClick: PropTypes.func
}

export default OuterFrame
