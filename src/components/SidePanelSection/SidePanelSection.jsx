import PropTypes from 'prop-types'

import './SidePanelSection.css'

/**
 * @description Renders a section within a side panel (title + content block).
 * @param {object} props - Component props.
 * @param {string} props.title - The title of the section.
 * @param {React.ReactNode} props.children - The content of the section (e.g., a list).
 * @param {string} [props.className] - Additional class names for the section group.
 */

const SidePanelSection = ({ title, children, className }) => {
  return (
    <div className={`panel-section-group ${className || ''}`}>
      {title && <h3 className="panel-main-section-title">{title}</h3>}
      <div className="panel-content-sticky-note">{children}</div>
    </div>
  )
}

SidePanelSection.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string
}

export default SidePanelSection
