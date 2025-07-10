import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'

import './CarouselSelector.css'

const CarouselSelector = ({ items, onSelect }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleNext = useCallback(() => {
    // Non-looping for 2 items
    if (items.length < 3) {
      setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, items.length - 1))

      // Looping for 3+ items
    } else {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length)
    }
  }, [items.length])

  const handlePrev = useCallback(() => {
    // Non-looping for 2 items
    if (items.length < 3) {
      setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0))

      // Looping for 3+ items
    } else {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length)
    }
  }, [items.length])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (items.length === 1 && e.key === 'Enter') {
        e.preventDefault()
        onSelect(items[0].id)
        return
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        handlePrev()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        handleNext()
      } else if (e.key === 'Enter') {
        e.preventDefault()
        onSelect(items[currentIndex].id)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, items, onSelect, handlePrev, handleNext])

  if (items.length === 1) {
    return (
      <div className="carousel-selector-container single-item">
        <div className="carousel-item offset-0 single" onClick={() => onSelect(items[0].id)}>
          {items[0].name}
        </div>
      </div>
    )
  }

  if (items.length === 2) {
    return (
      <div className="carousel-selector-container two-items">
        <button
          className="carousel-arrow up-arrow"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          ▲
        </button>
        <div className="carousel-items-window">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`carousel-item offset-${Math.abs(index - currentIndex)}`}
              style={{ transform: `translateY(${(index - currentIndex) * 45}px)` }}
              onClick={() => {
                if (index === currentIndex) onSelect(item.id)
              }}
            >
              {item.name}
            </div>
          ))}
        </div>
        <button
          className="carousel-arrow down-arrow"
          onClick={handleNext}
          disabled={currentIndex === 1}
        >
          ▼
        </button>
      </div>
    )
  }

  const getDisplayItems = () => {
    if (items.length === 0) return []
    const display = []
    for (let i = -2; i <= 2; i++) {
      const itemIndex = (currentIndex + i + items.length) % items.length
      display.push({ ...items[itemIndex], offset: i })
    }
    return display
  }

  const displayItems = getDisplayItems()

  const getTranslateY = (offset) => {
    if (offset === -2) return -75
    if (offset === 2) return 75
    return offset * 40
  }

  return (
    <div className="carousel-selector-container">
      <button className="carousel-arrow up-arrow" onClick={handlePrev}>
        ▲
      </button>
      <div className="carousel-items-window">
        {displayItems.map((item) => (
          <div
            key={`${item.id}-${item.offset}`}
            className={`carousel-item offset-${Math.abs(item.offset)}`}
            style={{ transform: `translateY(${getTranslateY(item.offset)}px)` }}
            onClick={() => {
              if (item.offset === 0) {
                onSelect(item.id)
              }
            }}
          >
            {item.name}
          </div>
        ))}
      </div>
      <button className="carousel-arrow down-arrow" onClick={handleNext}>
        ▼
      </button>
    </div>
  )
}

CarouselSelector.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired
    })
  ).isRequired,
  onSelect: PropTypes.func.isRequired
}

export default CarouselSelector
