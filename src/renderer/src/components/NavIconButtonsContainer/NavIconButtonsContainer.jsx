import PropTypes from 'prop-types'
import NavIconButton from '../NavIconButton/NavIconButton'

/**
 * @description Container for all the main navigation icon buttons.
 */

const NavIconButtonsContainer = ({ segmentData, onMouseEnter, onMouseLeave }) => {
  return (
    <div className="navigation-segments-container">
      {Object.keys(segmentData).map((key) => (
        <NavIconButton
          key={key}
          segmentKey={key}
          icon={segmentData[key].icon}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      ))}
    </div>
  )
}

NavIconButtonsContainer.propTypes = {
  segmentData: PropTypes.objectOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired
    })
  ).isRequired,
  onMouseEnter: PropTypes.func.isRequired,
  onMouseLeave: PropTypes.func.isRequired
}

export default NavIconButtonsContainer
