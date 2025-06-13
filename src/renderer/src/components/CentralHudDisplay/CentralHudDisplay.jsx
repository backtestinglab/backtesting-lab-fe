import CentralDisplayCore from '../CentralDisplayCore/CentralDisplayCore'

/**
 * @description Wrapper for the central part of the HUD, containing the display core.
 */

const CentralHUDDisplay = ({
  isLogoVisible,
  renderCoreTextContent,
  coreTextContentVisibleClass,
  coreDisplay,
  currentUsername
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
    </div>
  )
}

CentralHUDDisplay.propTypes = {
  ...CentralDisplayCore.propTypes
}

export default CentralHUDDisplay
