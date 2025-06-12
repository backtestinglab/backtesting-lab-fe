import PropTypes from 'prop-types'
import CentralDisplayCore from '../CentralDisplayCore/CentralDisplayCore'
import NavIconButtonsContainer from '../../components/NavIconButtonsContainer/NavIconButtonsContainer'

/**
 * @description Wrapper for the central part of the HUD, containing the display core.
 */

const CentralHUDDisplay = ({
  isLogoVisible,
  renderCoreTextContent,
  coreTextContentVisibleClass,
  coreDisplay,
  currentUsername,
  segmentData,
  onMouseEnter,
  onMouseLeave
}) => {
  return (
    <div className="main-hud-area">
      <CentralDisplayCore
        isLogoVisible={isLogoVisible}
        renderCoreTextContent={renderCoreTextContent}
        coreTextContentVisibleClass={coreTextContentVisibleClass}
        coreDisplay={coreDisplay}
        currentUsername={currentUsername}
      />
      <NavIconButtonsContainer
        segmentData={segmentData}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />
    </div>
  )
}

CentralHUDDisplay.propTypes = {
  ...CentralDisplayCore.propTypes,
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

export default CentralHUDDisplay
