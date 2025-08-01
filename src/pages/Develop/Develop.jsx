import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'

import Chart from '../../components/Chart/Chart'
import DrawingPropertiesToolbar from '../../components/DrawingPropertiesToolbar/DrawingPropertiesToolbar'
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
  const [toolbarPosition, setToolbarPosition] = useState({
    top: 15,
    left: '64%'
  })
  const [isToolbarDragging, setIsToolbarDragging] = useState(false)
  const dragDrawingToolbarRef = useRef(null)
  const chartAreaRef = useRef(null)
  const toolbarRef = useRef(null)

  useEffect(() => {
    const handleResize = () => {
      if (!toolbarRef.current || !chartAreaRef.current || !dragDrawingToolbarRef.current?.lastPin)
        return

      const chartPane = chartAreaRef.current.querySelector(
        '.tv-lightweight-charts table tr:first-child td:nth-child(2) div:first-child'
      )

      if (!chartPane) return

      const toolbar = toolbarRef.current
      const paneRect = chartPane.getBoundingClientRect()
      const toolbarWidth = toolbar.offsetWidth
      const toolbarHeight = toolbar.offsetHeight

      let newLeft = toolbarPosition.left
      let newTop = toolbarPosition.top

      if (dragDrawingToolbarRef.current.lastPin === 'right') {
        newLeft = paneRect.width - dragDrawingToolbarRef.current.distanceRight - toolbarWidth
      }

      const maxX = paneRect.width - toolbarWidth
      const maxY = paneRect.height - toolbarHeight
      newLeft = Math.max(0, Math.min(newLeft, maxX))
      newTop = Math.max(0, Math.min(newTop, maxY))

      setToolbarPosition({ left: newLeft, top: newTop })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [toolbarPosition])

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

  useEffect(() => {
    setSelectedDrawingId(null)
  }, [activeTool])

  const handleToolbarDragStart = useCallback((event) => {
    event.preventDefault()

    if (!chartAreaRef.current || !toolbarRef.current) return

    setIsToolbarDragging(true)

    const toolbarElement = toolbarRef.current
    const chartPane = chartAreaRef.current.querySelector(
      '.tv-lightweight-charts table tr:first-child td:nth-child(2) div:first-child'
    )

    if (!chartPane || !toolbarElement) {
      console.error('Could not find chart pane element for bounding.')
      return
    }

    const paneRect = chartPane.getBoundingClientRect()
    const chartAreaRect = chartAreaRef.current.getBoundingClientRect()

    dragDrawingToolbarRef.current = {
      chartAreaRect,
      paneRect,
      initialMouseX: event.clientX,
      initialMouseY: event.clientY,
      initialLeft: toolbarElement.offsetLeft,
      initialTop: toolbarElement.offsetTop,
      lastPin: dragDrawingToolbarRef.current?.lastPin || 'left',
      toolbarWidth: toolbarElement.offsetWidth,
      toolbarHeight: toolbarElement.offsetHeight
    }

    const handleToolbarDragMove = (moveEvent) => {
      if (!dragDrawingToolbarRef.current) return

      const {
        chartAreaRect,
        initialMouseX,
        initialMouseY,
        initialLeft,
        initialTop,
        paneRect,
        toolbarWidth,
        toolbarHeight
      } = dragDrawingToolbarRef.current

      const dx = moveEvent.clientX - initialMouseX
      const dy = moveEvent.clientY - initialMouseY

      let newLeft = initialLeft + dx
      let newTop = initialTop + dy

      const minX = paneRect.left - chartAreaRect.left
      const maxX = paneRect.right - chartAreaRect.left - toolbarWidth
      const minY = paneRect.top - chartAreaRect.top
      const maxY = paneRect.bottom - chartAreaRect.top - toolbarHeight

      newLeft = Math.max(minX, Math.min(newLeft, maxX))
      newTop = Math.max(minY, Math.min(newTop, maxY))

      setToolbarPosition({ top: newTop, left: newLeft })
    }

    const handleToolbarDragEnd = () => {
      window.removeEventListener('mousemove', handleToolbarDragMove)
      window.removeEventListener('mouseup', handleToolbarDragEnd)

      setIsToolbarDragging(false)

      if (!dragDrawingToolbarRef.current) return

      const finalToolbarElement = toolbarRef.current

      if (!finalToolbarElement) return

      const currentToolbarLeft = finalToolbarElement.offsetLeft

      const { paneRect, toolbarWidth } = dragDrawingToolbarRef.current
      const distanceLeft = currentToolbarLeft
      const distanceRight = paneRect.width - distanceLeft - toolbarWidth

      if (distanceLeft <= distanceRight) {
        dragDrawingToolbarRef.current.lastPin = 'left'
      } else {
        dragDrawingToolbarRef.current.lastPin = 'right'
        dragDrawingToolbarRef.current.distanceRight = distanceRight
      }
    }

    window.addEventListener('mousemove', handleToolbarDragMove)
    window.addEventListener('mouseup', handleToolbarDragEnd)
  }, [])

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

  const handleDrawingUpdate = (updatedDrawing) => {
    setDrawings((prevDrawings) =>
      prevDrawings.map((prevDrawing) =>
        prevDrawing.id === updatedDrawing.id ? updatedDrawing : prevDrawing
      )
    )
  }

  const handleDeleteDrawing = () => {
    if (!selectedDrawingId) return

    setDrawings((prevDrawings) =>
      prevDrawings.filter((drawing) => drawing.id !== selectedDrawingId)
    )

    setSelectedDrawingId(null)
  }

  const selectedDrawing = drawings.find((drawing) => drawing.id === selectedDrawingId)

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
        <section className="chart-area" ref={chartAreaRef}>
          {isLoading ? (
            <div className="placeholder-text">Loading Chart Data...</div>
          ) : (
            <>
              {selectedDrawingId && (
                <DrawingPropertiesToolbar
                  customStyles={{
                    top: `${toolbarPosition.top}px`,
                    left:
                      typeof toolbarPosition.left === 'string'
                        ? toolbarPosition.left
                        : `${toolbarPosition.left}px`
                  }}
                  drawingState={selectedDrawing}
                  isDragging={isToolbarDragging}
                  onDelete={handleDeleteDrawing}
                  onUpdate={handleDrawingUpdate}
                  onDragStart={handleToolbarDragStart}
                  toolbarRef={toolbarRef}
                />
              )}
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
                onDrawingUpdate={handleDrawingUpdate}
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
