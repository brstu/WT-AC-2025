import React from 'react'
import './ParticipantsList.css'

const ParticipantsList = ({ participants, maxParticipants, onRemove }) => {
  if (!participants || participants.length === 0) {
    return (
      <div className="participants-empty">
        <p>Пока нет участников</p>
        <small>Будьте первым, кто зарегистрируется!</small>
      </div>
    )
  }

  return (
    <div className="participants-list">
      <div className="participants-header">
        <h3>Участники ({participants.length}/{maxParticipants})</h3>
        <span className="participants-count">
          {Math.round((participants.length / maxParticipants) * 100)}% заполнено
        </span>
      </div>
      
      <div className="participants-grid">
        {participants.map((participant) => (
          <div key={participant.id} className="participant-card">
            <div className="participant-avatar">
              {participant.name.charAt(0).toUpperCase()}
            </div>
            <div className="participant-info">
              <h4 className="participant-name">{participant.name}</h4>
              <p className="participant-email">{participant.email}</p>
              {participant.phone && (
                <p className="participant-phone">{participant.phone}</p>
              )}
              <p className="participant-date">
                Зарегистрирован: {new Date(participant.registeredAt).toLocaleDateString('ru-RU')}
              </p>
            </div>
            {onRemove && (
              <button
                className="participant-remove-btn"
                onClick={() => onRemove(participant.id)}
                title="Удалить участника"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      
      <div className="participants-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${Math.min(100, (participants.length / maxParticipants) * 100)}%` 
            }}
          ></div>
        </div>
        <div className="progress-labels">
          <span>0</span>
          <span>{maxParticipants}</span>
        </div>
      </div>
    </div>
  )
}

export default ParticipantsList