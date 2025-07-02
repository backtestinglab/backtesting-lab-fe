import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import './ImportDataModal.css'

const ImportDataModal = ({ isOpen, onClose, onImport }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [datasetName, setDatasetName] = useState('')
  const [agreementChecked, setAgreementChecked] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null)
      setDatasetName('')
      setAgreementChecked(false)
    }
  }, [isOpen])

  const handleFileSelectClick = async () => {
    console.log('Requesting to open file dialog via main process...')

    const filePath = await window.api.openFileDialog()

    if (filePath) {
      console.log('File selected:', filePath)
      // In a real app, you'd get file size from the main process too, but we can mock it
      const fileName = filePath.split(/[\\/]/).pop()

      setSelectedFile({
        path: filePath,
        name: fileName,
        size: 0
      })
      setDatasetName(fileName.replace(/\.[^/.]+$/, ''))
    } else {
      console.log('File selection canceled.')
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setDatasetName('')
    setAgreementChecked(false)
  }

  const handleImportClick = async () => {
    if (selectedFile && datasetName.trim() && agreementChecked) {
      setIsImporting(true)

      const result = await window.api.importDataFile({
        filePath: selectedFile.path,
        datasetName: datasetName.trim()
      })

      setIsImporting(false)

      if (result.success) {
        console.log('Import success from renderer:', result.message)
        onImport(result)
        onClose()
      } else {
        console.error('Import error from renderer:', result.message)
        // TODO: Show an error message to the user inside the modal
        alert(`Error: ${result.message}`)
      }
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content import-data-modal">
        <div className="modal-header">
          <h2>Import New Dataset(s)</h2>
          <button onClick={onClose} className="modal-close-button" title="Close">
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="file-selection-area">
            <button onClick={handleFileSelectClick} className="browse-files-button">
              {selectedFile ? 'Change File...' : 'Select .CSV or .JSON File'}
            </button>
            {selectedFile && (
              <div className="selected-file-info">
                <div className="file-details">
                  <p>
                    <strong>File:</strong> {selectedFile.name}
                  </p>
                  <p>
                    <strong>Size:</strong> {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="remove-file-button"
                  title="Remove selected file"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="dataset-naming-area">
              <label htmlFor="datasetName">Dataset Name in App:</label>
              <input
                type="text"
                id="datasetName"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                placeholder="e.g., SPY 1-min 2022"
              />
            </div>
          )}

          <div className="disclaimer-area">
            <p className="disclaimer-text">
              All data is <strong>stored locally on your machine.</strong> BacktestingLab does not
              upload or store your data on any external servers. Please ensure you have{' '}
              <strong>backups of</strong> your <strong>original data files and </strong> any{' '}
              <strong>data created from</strong> using <strong>this app.</strong> See the{' '}
              <strong>"Backup" tab</strong> in settings for full details.
            </p>
            <label className="agreement-checkbox-label">
              <input
                type="checkbox"
                checked={agreementChecked}
                onChange={(e) => setAgreementChecked(e.target.checked)}
              />
              <p>
                I understand and agree that my data is <strong>stored locally</strong> and I am{' '}
                <strong>responsible for backups.</strong>
              </p>
            </label>
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="modal-button cancel-button">
            Cancel
          </button>
          <button
            onClick={handleImportClick}
            className="modal-button import-button"
            disabled={!selectedFile || !datasetName.trim() || !agreementChecked || isImporting}
          >
            {isImporting ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  )
}

ImportDataModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired
}

export default ImportDataModal
