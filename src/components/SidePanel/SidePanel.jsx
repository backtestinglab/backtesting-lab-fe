import PropTypes from 'prop-types'

import './SidePanel.css'

/**
 * @description Renders a side panel (left or right).
 * @param {object} props - Component props.
 * @param {'left' | 'right'} props.position - Determines if it's the left or right panel.
 * @param {React.ReactNode} props.children - The sections or content to be rendered within the panel.
 */
const SidePanel = ({ position, children }) => {
  return <div className={`side-panel ${position}-panel`}>{children}</div>
}

SidePanel.propTypes = {
  position: PropTypes.oneOf(['left', 'right']).isRequired,
  children: PropTypes.node.isRequired
}

export default SidePanel
