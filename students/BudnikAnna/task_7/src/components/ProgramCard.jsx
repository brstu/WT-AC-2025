import { Link } from 'react-router-dom'

export function ProgramCard({ program }) {
  return (
    <Link to={`/programs/${program.id}`} className="card card--click">
      <div className="row row--between">
        <div>
          <div className="title">{program.title}</div>
          <div className="muted">
            {program.level} • {program.durationWeeks} нед • {program.sessionsPerWeek} трен/нед
          </div>
        </div>
        <div className="pill">{program.goal}</div>
      </div>
      <p className="muted" style={{ marginBottom: 0 }}>
        {program.description?.slice(0, 110) || '—'}
        {program.description?.length > 110 ? '…' : ''}
      </p>
    </Link>
  )
}