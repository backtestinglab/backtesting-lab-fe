import React, { useContext, useEffect, useState } from 'react'

import Chart from '../../components/Chart/Chart'
import DrawingToolbar from '../../components/DrawingToolbar/DrawingToolbar'

import logo from '../../assets/logo.svg'
import { AppViewContext } from '../../contexts/AppViewContext'

import './Develop.css'

/**
 * @description The main page for developing a new trading model.
 */
const Develop = ({ modelConfig }) => {
  const { navigateTo } = useContext(AppViewContext)
  const [chartData, setChartData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTimeframe, setActiveTimeframe] = useState(
    modelConfig?.selectedTimeframes?.[0] || null
  )
  const [isVolumeVisible, setIsVolumeVisible] = useState(false)
  const [activeTool, setActiveTool] = useState('cursor')
  const [drawings, setDrawings] = useState([])
  const [selectedDrawingId, setSelectedDrawingId] = useState(null)

  useEffect(() => {
    console.log('DevelopPage mounted with config:', modelConfig)

    const fetchChartData = async () => {
      if (!modelConfig?.dataset?.id || !activeTimeframe) {
        return
      }

      setIsLoading(true)

      const result = await window.api.getChartData({
        datasetId: modelConfig.dataset.id,
        timeframe: activeTimeframe
      })

      if (result.success) {
        setChartData(result.data)
      } else {
        console.error('Failed to load chart data:', result.message)
      }
      setIsLoading(false)
    }

    fetchChartData()
  }, [activeTimeframe, modelConfig])

  const selectedTimeframes = modelConfig?.selectedTimeframes || []

  const handleToolSelect = (toolId) => {
    setActiveTool((prevTool) => (prevTool === toolId ? 'cursor' : toolId))
  }

  const handleDrawingAdd = (newDrawing) => {
    setDrawings((prevDrawings) => [...prevDrawings, newDrawing])
  }

  const handleDrawingSelect = (drawingId) => {
    setSelectedDrawingId((prevId) => (prevId === drawingId ? null : drawingId))
  }

  const modelTypeDisplay = modelConfig?.type
    ? modelConfig.type.charAt(0).toUpperCase() + modelConfig.type.slice(1)
    : ''

  return (
    <div className="develop-page">
      <header className="develop-page-header">
        <div className="header-left">
          <img src={logo} className="header-logo" alt="BacktestingLab Logo" />
        </div>
        <div className="header-center">
          <div className="header-title">
            <span className="header-prefix">Develop:</span>
            <span className="header-dataset-name">{modelConfig?.dataset?.name || 'New Model'}</span>
            {modelTypeDisplay && (
              <span className="header-model-type">({modelTypeDisplay} Model)</span>
            )}
          </div>
        </div>
        <div className="header-right">
          <button className="back-button" onClick={() => navigateTo('home')}>
            ← Home
          </button>
        </div>
      </header>
      <main className="develop-workspace">
        <section className="chart-area">
          {isLoading ? (
            <div className="placeholder-text">Loading Chart Data...</div>
          ) : (
            <>
              <DrawingToolbar activeTool={activeTool} onToolSelect={handleToolSelect} />
              <div className="timeframe-switcher">
                {selectedTimeframes.map((tf) => (
                  <button
                    key={tf}
                    className={`timeframe-button ${activeTimeframe === tf ? 'active' : ''}`}
                    onClick={() => setActiveTimeframe(tf)}
                  >
                    {tf}
                  </button>
                ))}
              </div>
              <div className="chart-indicators-display">
                <div className="indicator-item">
                  <span className="indicator-name">Volume</span>
                  <button
                    className="indicator-toggle-visibility"
                    onClick={() => setIsVolumeVisible(!isVolumeVisible)}
                    title={isVolumeVisible ? 'Hide Volume' : 'Show Volume'}
                  >
                    {isVolumeVisible ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
              <Chart
                activeTool={activeTool}
                data={chartData}
                drawings={drawings}
                isVolumeVisible={isVolumeVisible}
                onDrawingAdd={handleDrawingAdd}
                onDrawingSelect={handleDrawingSelect}
                selectedDrawingId={selectedDrawingId}
              />
            </>
          )}
        </section>

        <section className="condition-editor-area">
          <div className="panel-header">
            <h3>Base Condition</h3>
            {/* Add buttons for GUI/JS mode, minimize, etc. later */}
          </div>
          <div className="placeholder-text">Condition Editor</div>
        </section>

        <section className="results-area">
          <div className="panel-header">
            <h3>Occurrences (0)</h3>
            <div className="results-controls">
              <button title="Previous Occurrence" className="up-arrow">
                ▲
              </button>
              <button title="Next Occurrence" className="down-arrow">
                ▲
              </button>
            </div>
          </div>
          <div className="placeholder-text">Results Table</div>
        </section>
      </main>
    </div>
  )
}

// Add PropTypes later when props are finalized

export default Develop
