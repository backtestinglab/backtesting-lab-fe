import React, { useEffect, useState } from 'react'

import ConfirmationModal from '../../components/Modals/ConfirmationModal'
import ImportDataModal from '../../components/Modals/ImportDataModal'

import EmptyStateIcon from '../../assets/icons/EmptyStateIcon'

import './DataManagement.css'

const DataManagement = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [datasets, setDatasets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [datasetToDelete, setDatasetToDelete] = useState(null)

  const fetchDatasets = async () => {
    setIsLoading(true)
    const result = await window.api.getAllDatasets()
    if (result.success) {
      setDatasets(result.data)
    } else {
      console.error(result.message)
      // TODO: show an error toast/message to the user
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchDatasets()
  }, [])

  const handleImportClick = () => {
    setIsImportModalOpen(true)
  }

  const handleModalClose = () => {
    setIsImportModalOpen(false)
  }

  const handleDataImported = (importedDataResult) => {
    console.log('Import successful, refreshing dataset list...', importedDataResult)
    fetchDatasets()
  }

  const handleDeleteClick = (dataset) => {
    setDatasetToDelete(dataset)
    setShowConfirmDelete(true)
  }

  const handleConfirmDelete = async () => {
    if (!datasetToDelete) return

    const result = await window.api.deleteDataset(datasetToDelete.id)
    if (result.success) {
      console.log(`Successfully deleted dataset ${datasetToDelete.id}`)
      fetchDatasets()
    } else {
      console.error(result.message)
      alert(`Error: ${result.message}`)
    }
    closeConfirmDeleteModal()
  }

  const closeConfirmDeleteModal = () => {
    setShowConfirmDelete(false)
    setDatasetToDelete(null)
  }

  const renderContent = () => {
    if (isLoading) {
      return <p>Loading datasets...</p>
    }

    if (datasets.length === 0) {
      return (
        <div className="empty-state-container">
          <h3>No Datasets Found!</h3>
          <p>You haven't imported any data yet. Click the button above to get started.</p>
          <EmptyStateIcon className="empty-state-icon" />
        </div>
      )
    }

    return (
      <table className="dataset-list-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Symbol</th>
            <th>Range</th>
            <th>Imported</th>
            <th>Available TFs</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {datasets.map((ds) => (
            <tr key={ds.id}>
              <td>{ds.name}</td>
              <td>{ds.symbol || 'N/A'}</td>
              <td>{ds.date_range || 'N/A'}</td>
              <td>{ds.import_date}</td>
              <td>{ds.available_timeframes}</td>
              <td>Ready</td>
              <td className="actions-cell">
                <button title="View Details">ℹ️</button>
                <button title="Delete Dataset" onClick={() => handleDeleteClick(ds)}>
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  return (
    <div className="data-management-section">
      <div className="data-management-header">
        <h3>My Datasets</h3>
      </div>

      <div className="import-data-button-area">
        <p className="description-text">Import your (1-minute) OHLCV data to begin backtesting.</p>
        <div className="divider-line"></div>
        <button className="import-data-button" onClick={handleImportClick}>
          <span className="plus-icon">+</span> Import New Data
        </button>
      </div>

      <div className="dataset-list-container">{renderContent()}</div>

      <ImportDataModal
        isOpen={isImportModalOpen}
        onClose={handleModalClose}
        onImport={handleDataImported}
      />
      <ConfirmationModal
        isOpen={showConfirmDelete}
        onClose={closeConfirmDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
      >
        <p>
          Are you sure you want to delete the dataset: <strong>{datasetToDelete?.name}</strong>?
        </p>
        <p>This action cannot be undone and will permanently remove all associated data files.</p>
      </ConfirmationModal>
    </div>
  )
}

export default DataManagement
