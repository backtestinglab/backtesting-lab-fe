import React, { useState, useContext } from 'react'
import { AppViewContext } from '../../contexts/AppViewContext'
import DataManagement from './DataManagement'

import './Settings.css'

const Settings = () => {
  const { navigateTo } = useContext(AppViewContext)
  const [activeSection, setActiveSection] = useState('dataManagement')

  const renderSection = () => {
    if (activeSection === 'dataManagement') {
      return <DataManagement />
    }
    if (activeSection === 'userProfile') {
      return <div>User Profile Content Placeholder</div>
    }
    if (activeSection === 'appearance') {
      return <div>Appearance Settings Placeholder</div>
    }
    // Add more sections later (e.g., Backup)
    return null
  }

  return (
    <div className="settings-page">
      <div className="settings-sidebar">
        <button
          className="settings-close-button"
          onClick={() => navigateTo('home')}
          title="Close Settings"
        >
          ×
        </button>
        <h2>Settings</h2>
        <ul>
          <li
            className={activeSection === 'dataManagement' ? 'active' : ''}
            onClick={() => setActiveSection('dataManagement')}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setActiveSection('dataManagement')}
          >
            Data Management
          </li>
          <li
            className={activeSection === 'userProfile' ? 'active' : ''}
            onClick={() => setActiveSection('userProfile')}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setActiveSection('userProfile')}
          >
            User Profile
          </li>
          <li
            className={activeSection === 'appearance' ? 'active' : ''}
            onClick={() => setActiveSection('appearance')}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setActiveSection('appearance')}
          >
            Appearance
          </li>
          {/* Add "Backup" section here later */}
        </ul>
      </div>
      <div className="settings-content-area">{renderSection()}</div>
    </div>
  )
}

export default Settings
