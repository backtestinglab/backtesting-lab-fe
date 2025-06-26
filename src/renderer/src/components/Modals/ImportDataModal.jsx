import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import './ImportDataModal.css'

const ImportDataModal = ({ isOpen, onClose, onImport }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [datasetName, setDatasetName] = useState('')
  const [agreementChecked, setAgreementChecked] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null)
      setDatasetName('')
      setAgreementChecked(false)
    }
  }, [isOpen])

  const handleFileSelectClick = () => {
    console.log('Trigger system file dialog (mocked)')
    // Mock file selection
    const mockFile = { name: 'SPY_1min_2022.csv', size: 1024 * 1024 * 50 }
    setSelectedFile(mockFile)
    setDatasetName(mockFile.name.replace(/\.[^/.]+$/, ''))
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setDatasetName('')
    setAgreementChecked(false)
  }

  const handleImportClick = () => {
    if (selectedFile && datasetName.trim() && agreementChecked) {
      onImport({
        file: selectedFile, // In reality, this would be a file path or File object
        name: datasetName.trim()
      })
      onClose()
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
              {selectedFile ? 'Change File...' : 'Select .CSV File'}
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
              <strong>backups of your original data files.</strong>
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
            disabled={!selectedFile || !datasetName.trim() || !agreementChecked}
          >
            Import
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
