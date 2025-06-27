import { useState } from 'react'
import ImportDataModal from '../../components/Modals/ImportDataModal'

const DataManagement = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  const handleImportClick = () => {
    setIsImportModalOpen(true)
  }

  const handleModalClose = () => {
    setIsImportModalOpen(false)
  }

  const handleDataImported = (importedData) => {
    console.log('Data to import:', importedData)
    // Here, you'd eventually trigger the actual backend import process
    // and update your list of datasets.
  }

  // Placeholder data
  const datasets = [
    {
      id: 1,
      name: 'NQ 1-min 2020-2023',
      symbol: 'NQ',
      timeframe: '1-min',
      dateRange: '3 Years',
      size: '350MB',
      importDate: '2023-05-01',
      availableTF: '1m,5m,15m,1H,4H,D',
      status: 'Ready'
    },
    {
      id: 2,
      name: 'ES 1-min 2019-2022',
      symbol: 'ES',
      timeframe: '1-min',
      dateRange: '4 Years',
      size: '450MB',
      importDate: '2023-04-15',
      availableTF: '1m,5m,15m,1H,D',
      status: 'Processing'
    }
  ]

  return (
    <div className="data-management-section">
      <div className="data-management-header">
        <h3>My Datasets</h3>
      </div>

      <div className="import-data-button-area">
        <p className="description-text">Import your 1-minute OHLCV data to begin backtesting.</p>
        <div className="divider-line"></div>
        <button className="import-data-button" onClick={handleImportClick}>
          <span className="plus-icon">+</span> Import New Data
        </button>
      </div>

      {datasets.length === 0 ? (
        <p>No datasets imported yet.</p>
      ) : (
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
                <td>{ds.symbol}</td>
                <td>{ds.dateRange}</td>
                <td>{ds.importDate}</td>
                <td>{ds.availableTF}</td>
                <td>{ds.status}</td>
                <td className="actions-cell">
                  <button title="View Details">ℹ️</button>
                  <button title="Delete Dataset">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <ImportDataModal
        isOpen={isImportModalOpen}
        onClose={handleModalClose}
        onImport={handleDataImported}
      />
    </div>
  )
}

export default DataManagement
