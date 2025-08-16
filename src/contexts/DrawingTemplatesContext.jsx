import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'

const DrawingTemplatesContext = createContext()

export const useDrawingTemplates = () => {
  const context = useContext(DrawingTemplatesContext)
  if (!context) {
    throw new Error('useDrawingTemplates must be used within a DrawingTemplatesProvider')
  }
  return context
}

export const DrawingTemplatesProvider = ({ children }) => {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true)
      const result = await window.api.getDrawingTemplates()
      if (result.success) {
        setTemplates(result.data)
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      console.error('Failed to fetch drawing templates:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const addTemplate = (newTemplate) => {
    setTemplates((prevTemplates) => [...prevTemplates, newTemplate])
  }

  const updateTemplate = (updatedTemplate) => {
    setTemplates((prevTemplates) =>
      prevTemplates.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t))
    )
  }

  const removeTemplate = (templateId) => {
    setTemplates((prevTemplates) => prevTemplates.filter((t) => t.id !== templateId))
  }

  const value = { templates, loading, error, addTemplate, updateTemplate, removeTemplate }

  return (
    <DrawingTemplatesContext.Provider value={value}>{children}</DrawingTemplatesContext.Provider>
  )
}

DrawingTemplatesProvider.propTypes = {
  children: PropTypes.node.isRequired
}
