import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

import Chart from '../../components/Chart/Chart'
import DrawingPropertiesToolbar from '../../components/DrawingPropertiesToolbar/DrawingPropertiesToolbar'
import DrawingSettingsModal from '../../components/DrawingSettingsModal/DrawingSettingsModal'
import DrawingToolbar from '../../components/DrawingToolbar/DrawingToolbar'
import SaveTemplateModal from '../../components/SaveTemplateModal/SaveTemplateModal'

import logo from '../../assets/logo.svg'
import { AppViewContext } from '../../contexts/AppViewContext'
import { useDrawingTemplates } from '../../contexts/DrawingTemplatesContext'
import { HORIZONTAL_LINE_DEFAULTS } from '../../config/drawingDefaults'

import './Develop.css'

/**
 * @description The main page for developing a new trading model.
 */
const Develop = ({ modelConfig }) => {
  const { navigateTo } = useContext(AppViewContext)

  const [activeTimeframe, setActiveTimeframe] = useState(
    modelConfig?.selectedTimeframes?.[0] || null
  )
  const [activeTool, setActiveTool] = useState('cursor')
  const [chartData, setChartData] = useState([])
  const [drawings, setDrawings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalDragging, setIsModalDragging] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isToolbarDragging, setIsToolbarDragging] = useState(false)
  const [isVolumeVisible, setIsVolumeVisible] = useState(false)
  const [modalPosition, setModalPosition] = useState({
    top: -9999,
    left: -9999
  })
  const [selectedDrawingId, setSelectedDrawingId] = useState(null)
  const [toolbarPosition, setToolbarPosition] = useState({
    top: 15,
    left: '64%'
  })

  // Templates state & refs
  const [isDraggingSaveModal, setIsDraggingSaveModal] = useState(false)
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false)
  const [saveModalPosition, setSaveModalPosition] = useState({ x: 0, y: 0 })
  const saveTemplateModalRef = useRef(null)

  const chartAreaRef = useRef(null)
  const dragDrawingToolbarRef = useRef(null)
  const modalRef = useRef(null)
  const toolbarRef = useRef(null)

  const { templates, addTemplate, updateTemplate, removeTemplate } = useDrawingTemplates()

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

  useLayoutEffect(() => {
    if (isSettingsModalOpen && modalRef.current && chartAreaRef.current) {
      const chartPane = chartAreaRef.current.querySelector(
        '.tv-lightweight-charts table tr:first-child td:nth-child(2) div:first-child'
      )
      if (!chartPane) return

      const paneRect = chartPane.getBoundingClientRect()
      const chartAreaRect = chartAreaRef.current.getBoundingClientRect()
      const modalWidth = modalRef.current.offsetWidth
      const modalHeight = modalRef.current.offsetHeight

      // Center the modal in the chart pane, relative to the chart area
      const newLeft = paneRect.left - chartAreaRect.left + paneRect.width / 2 - modalWidth / 2
      const newTop = paneRect.top - chartAreaRect.top + paneRect.height / 2 - modalHeight / 2

      setModalPosition({ top: newTop, left: newLeft })
    }
  }, [isSettingsModalOpen])

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

  const handleModalDragStart = useCallback((event) => {
    event.preventDefault()

    if (!chartAreaRef.current || !modalRef.current) return

    setIsModalDragging(true)

    const modalElement = modalRef.current
    const chartPane = chartAreaRef.current.querySelector(
      '.tv-lightweight-charts table tr:first-child td:nth-child(2) div:first-child'
    )

    if (!chartPane || !modalElement) {
      console.error('Could not find chart pane element for bounding.')
      return
    }

    const paneRect = chartPane.getBoundingClientRect()
    const chartAreaRect = chartAreaRef.current.getBoundingClientRect()

    const dragRef = {
      chartAreaRect,
      paneRect,
      initialMouseX: event.clientX,
      initialMouseY: event.clientY,
      initialLeft: modalElement.offsetLeft,
      initialTop: modalElement.offsetTop,
      modalWidth: modalElement.offsetWidth,
      modalHeight: modalElement.offsetHeight
    }

    const handleModalDragMove = (moveEvent) => {
      const {
        chartAreaRect,
        initialMouseX,
        initialMouseY,
        initialLeft,
        initialTop,
        paneRect,
        modalWidth,
        modalHeight
      } = dragRef

      const dx = moveEvent.clientX - initialMouseX
      const dy = moveEvent.clientY - initialMouseY

      let newLeft = initialLeft + dx
      let newTop = initialTop + dy

      const minX = paneRect.left - chartAreaRect.left
      const maxX = paneRect.right - chartAreaRect.left - modalWidth
      const minY = paneRect.top - chartAreaRect.top
      const maxY = paneRect.bottom - chartAreaRect.top - modalHeight

      newLeft = Math.max(minX, Math.min(newLeft, maxX))
      newTop = Math.max(minY, Math.min(newTop, maxY))

      setModalPosition({ top: newTop, left: newLeft })
    }

    const handleModalDragEnd = () => {
      window.removeEventListener('mousemove', handleModalDragMove)
      window.removeEventListener('mouseup', handleModalDragEnd)
      setIsModalDragging(false)
    }

    window.addEventListener('mousemove', handleModalDragMove)
    window.addEventListener('mouseup', handleModalDragEnd)
  }, [])

  const selectedTimeframes = modelConfig?.selectedTimeframes || []

  const handleToolSelect = (toolId) => {
    setActiveTool((prevTool) => (prevTool === toolId ? 'cursor' : toolId))
  }

  const handleOpenSettingsModal = () => {
    setIsSettingsModalOpen(true)
  }

  const openSaveNewTemplateModal = () => {
    if (!chartAreaRef.current) return

    const chartAreaRect = chartAreaRef.current.getBoundingClientRect()

    if (toolbarRef.current) {
      const toolbarRect = toolbarRef.current.getBoundingClientRect()
      const initialX = toolbarRect.left - chartAreaRect.left + toolbarRect.width / 2 - 175 // 350 is modal width
      const initialY = toolbarRect.top - chartAreaRect.top + 50
      setSaveModalPosition({ x: initialX, y: initialY })
    }

    if (modalRef.current) {
      const modalRect = modalRef.current.getBoundingClientRect()
      const initialX = modalRect.left - chartAreaRect.left + modalRect.width / 2 - 175 // 350 is modal width
      const initialY = modalRect.top - chartAreaRect.top + 50
      setSaveModalPosition({ x: initialX, y: initialY })
    }
    setIsSaveTemplateModalOpen(true)
  }

  const handleSaveTemplate = async (templateName) => {
    const selectedDrawing = drawings.find((drawing) => drawing.id === selectedDrawingId)
    if (!selectedDrawing) return

    const styleSettings = {
      lineColor: selectedDrawing.lineColor,
      lineWidth: selectedDrawing.lineWidth,
      lineStyle: selectedDrawing.lineStyle,
      text: selectedDrawing.text,
      textColor: selectedDrawing.textColor,
      fontSize: selectedDrawing.fontSize,
      fontWeight: selectedDrawing.fontWeight,
      textAlign: selectedDrawing.textAlign,
      textVerticalAlign: selectedDrawing.textVerticalAlign
    }

    const templateData = {
      name: templateName,
      drawing_type: selectedDrawing.type,
      settings: styleSettings
    }

    try {
      const result = await window.api.saveDrawingTemplate(templateData)
      if (result.success) {
        const savedTemplate = result.data
        const existingTemplate = templates.find((template) => template.id === savedTemplate.id)
        if (existingTemplate) {
          updateTemplate(savedTemplate)
        } else {
          addTemplate(savedTemplate)
        }
        setIsSaveTemplateModalOpen(false)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Failed to save template:', error)
      alert('Failed to save template!')
    }
  }

  const handleApplyTemplate = (template) => {
    const selectedDrawing = drawings.find((drawing) => drawing.id === selectedDrawingId)
    if (!selectedDrawing) return

    const newSettings = { ...selectedDrawing, ...template.settings }
    handleDrawingUpdate(newSettings)
  }

  const handleResetToDefaults = () => {
    const selectedDrawing = drawings.find((drawing) => drawing.id === selectedDrawingId)
    if (!selectedDrawing) return

    // Resets the drawing to its factory default settings.
    const defaultSettings = HORIZONTAL_LINE_DEFAULTS
    const newSettings = { ...selectedDrawing, ...defaultSettings }
    handleDrawingUpdate(newSettings)
  }

  const handleDeleteTemplate = async (templateId) => {
    try {
      const result = await window.api.deleteDrawingTemplate(templateId)
      if (result.success) {
        removeTemplate(templateId)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Failed to delete template:', error)
      alert(`Failed to delete template!`)
    }
  }

  const handleSaveModalDragStart = useCallback((event) => {
    event.preventDefault()

    if (!chartAreaRef.current || !saveTemplateModalRef.current) return

    setIsDraggingSaveModal(true)

    const modalElement = saveTemplateModalRef.current
    const chartPane = chartAreaRef.current.querySelector(
      '.tv-lightweight-charts table tr:first-child td:nth-child(2) div:first-child'
    )

    if (!chartPane || !modalElement) {
      console.error('Could not find chart pane element for bounding.')
      return
    }

    const paneRect = chartPane.getBoundingClientRect()
    const chartAreaRect = chartAreaRef.current.getBoundingClientRect()

    const dragRef = {
      chartAreaRect,
      paneRect,
      initialMouseX: event.clientX,
      initialMouseY: event.clientY,
      initialLeft: modalElement.offsetLeft,
      initialTop: modalElement.offsetTop,
      modalWidth: modalElement.offsetWidth,
      modalHeight: modalElement.offsetHeight
    }

    const handleModalDragMove = (moveEvent) => {
      const {
        chartAreaRect,
        initialMouseX,
        initialMouseY,
        initialLeft,
        initialTop,
        paneRect,
        modalWidth,
        modalHeight
      } = dragRef

      const dx = moveEvent.clientX - initialMouseX
      const dy = moveEvent.clientY - initialMouseY

      let newLeft = initialLeft + dx
      let newTop = initialTop + dy

      const minX = paneRect.left - chartAreaRect.left
      const maxX = paneRect.right - chartAreaRect.left - modalWidth
      const minY = paneRect.top - chartAreaRect.top
      const maxY = paneRect.bottom - chartAreaRect.top - modalHeight

      newLeft = Math.max(minX, Math.min(newLeft, maxX))
      newTop = Math.max(minY, Math.min(newTop, maxY))

      setSaveModalPosition({ x: newLeft, y: newTop })
    }

    const handleModalDragEnd = () => {
      window.removeEventListener('mousemove', handleModalDragMove)
      window.removeEventListener('mouseup', handleModalDragEnd)
      setIsDraggingSaveModal(false)
    }

    window.addEventListener('mousemove', handleModalDragMove)
    window.addEventListener('mouseup', handleModalDragEnd)
  }, [])

  const handleDrawingAdd = (newDrawing) => {
    setDrawings((prevDrawings) => [...prevDrawings, newDrawing])
  }

  const handleDrawingSelect = (drawingId) => {
    setSelectedDrawingId((prevId) => (prevId === drawingId ? null : drawingId))
    setIsSettingsModalOpen(false)
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

  const filteredTemplates = templates.filter(
    (template) => template.drawing_type === selectedDrawing?.type
  )

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
              {selectedDrawingId && !isSettingsModalOpen && (
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
                  onDragStart={handleToolbarDragStart}
                  onSettingsClick={handleOpenSettingsModal}
                  onUpdate={handleDrawingUpdate}
                  toolbarRef={toolbarRef}
                  // Templates props
                  onApplyTemplate={handleApplyTemplate}
                  onDeleteTemplate={handleDeleteTemplate}
                  onResetToDefaults={handleResetToDefaults}
                  onOpenSaveTemplateModal={openSaveNewTemplateModal}
                  templates={filteredTemplates}
                />
              )}
              {isSettingsModalOpen && selectedDrawing && (
                <DrawingSettingsModal
                  customStyles={{
                    top: `${modalPosition.top}px`,
                    left:
                      typeof modalPosition.left === 'string'
                        ? modalPosition.left
                        : `${modalPosition.left}px`
                  }}
                  drawing={selectedDrawing}
                  isDragging={isModalDragging}
                  modalRef={modalRef}
                  onUpdate={handleDrawingUpdate}
                  onClose={() => setIsSettingsModalOpen(false)}
                  onDragStart={handleModalDragStart}
                  dragBoundsRef={chartAreaRef}
                  // Templates props
                  templates={filteredTemplates}
                  onApplyTemplate={handleApplyTemplate}
                  onOpenSaveTemplateModal={openSaveNewTemplateModal}
                  onResetToDefaults={handleResetToDefaults}
                  onDeleteTemplate={handleDeleteTemplate}
                />
              )}
              {isSaveTemplateModalOpen && (
                <SaveTemplateModal
                  customStyles={{
                    left: `${saveModalPosition.x}px`,
                    top: `${saveModalPosition.y}px`
                  }}
                  isDragging={isDraggingSaveModal}
                  modalRef={saveTemplateModalRef}
                  onClose={() => setIsSaveTemplateModalOpen(false)}
                  onDragStart={handleSaveModalDragStart}
                  onSave={handleSaveTemplate}
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

Develop.propTypes = {
  modelConfig: PropTypes.shape({
    dataset: PropTypes.shape({
      name: PropTypes.string
    }),
    type: PropTypes.string
  })
}

export default Develop
