import React, { useState } from 'react'
import PropTypes from 'prop-types'

/**
 * StreaksCard displays best win streak and worst lose streak with interactive vertical bars.
 * Clicking a bar toggles its opacity between 100% (active) and 30% (inactive).
 * Default state: win streak is active (100%), lose streak is inactive (30%).
 */
const StreaksCard = ({ bestWinStreak, worstLoseStreak }) => {
  const hasData =
    typeof bestWinStreak === 'number' &&
    bestWinStreak >= 0 &&
    typeof worstLoseStreak === 'number' &&
    worstLoseStreak >= 0

  const [activeBar, setActiveBar] = useState('win')

  if (!hasData) {
    return (
      <div className="streaks-card-content">
        <span className="no-data">No data</span>
      </div>
    )
  }

  const maxStreak = Math.max(bestWinStreak, worstLoseStreak, 1)
  const winHeightPercent = (bestWinStreak / maxStreak) * 100
  const loseHeightPercent = (worstLoseStreak / maxStreak) * 100

  const handleBarClick = (barType) => {
    setActiveBar(barType)
  }

  const activeStreak = activeBar === 'win' ? bestWinStreak : worstLoseStreak
  const streakLabel = activeBar === 'win' ? 'consecutive wins' : 'consecutive losses'

  return (
    <div className="streaks-card-content">
      <div className="streak-badge-top">
        <span className="streak-value-large">{activeStreak}</span>
      </div>

      <div className="streaks-bars-container">
        {/* Win Streak Bar */}
        <div className="streak-bar-wrapper">
          <div className="streak-bar-container">
            <div
              className={`streak-bar win ${activeBar === 'win' ? 'active' : 'inactive'}`}
              onClick={() => handleBarClick('win')}
              style={{ height: `${winHeightPercent}%` }}
            >
              <div className="streak-bar-fill" />
            </div>
          </div>
        </div>

        {/* Lose Streak Bar */}
        <div className="streak-bar-wrapper">
          <div className="streak-bar-container">
            <div
              className={`streak-bar lose ${activeBar === 'lose' ? 'active' : 'inactive'}`}
              onClick={() => handleBarClick('lose')}
              style={{ height: `${loseHeightPercent}%` }}
            >
              <div className="streak-bar-fill" />
            </div>
          </div>
        </div>
      </div>

      <div className="streak-label-bottom">{streakLabel}</div>
    </div>
  )
}

StreaksCard.propTypes = {
  bestWinStreak: PropTypes.number,
  worstLoseStreak: PropTypes.number
}

StreaksCard.defaultProps = {
  bestWinStreak: null,
  worstLoseStreak: null
}

export default StreaksCard
