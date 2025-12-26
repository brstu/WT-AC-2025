import { useMemo, useState } from 'react'
import { useGetProgramsQuery } from '../../app/api/programsApi'
import { Spinner } from '../../components/Spinner'
import { StateBlock } from '../../components/StateBlock'
import { ProgramCard } from '../../components/ProgramCard'

export function ProgramsList() {
  const { data, isLoading, isError, refetch } = useGetProgramsQuery()
  const [q, setQ] = useState('')
  const [level, setLevel] = useState('all')

  const filtered = useMemo(() => {
    const list = Array.isArray(data) ? data : []
    const query = q.trim().toLowerCase()

    return list
      .filter((p) => (level === 'all' ? true : p.level === level))
      .filter((p) => {
        if (!query) return true
        return (
          p.title?.toLowerCase().includes(query) ||
          p.goal?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
        )
      })
      .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))
  }, [data, q, level])

  if (isLoading) return <Spinner />
  if (isError)
    return (
      <StateBlock
        title="Ошибка загрузки"
        text="Не удалось получить список программ. Проверь, что json-server запущен (npm run api) и .env корректный."
        action={<button className="btn" onClick={() => refetch()}>Повторить</button>}
      />
    )

  if (!filtered.length)
    return (
      <StateBlock
        title="Пусто"
        text="По текущим фильтрам ничего не найдено. Сбрось фильтры или добавь новую программу."
        action={
          <div className="row">
            <button className="btn" onClick={() => { setQ(''); setLevel('all') }}>Сбросить</button>
            <button className="btn btn--ghost" onClick={() => refetch()}>Обновить</button>
          </div>
        }
      />
    )

  return (
    <div className="stack">
      <h1 style={{ margin: 0 }}>Каталог тренажёрных программ</h1>

      <div className="card">
        <div className="row">
          <input
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск: название, цель, описание…"
          />
          <select className="input" value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="all">Все уровни</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          <button className="btn btn--ghost" onClick={() => refetch()}>
            Обновить
          </button>
        </div>
        <div className="muted" style={{ marginTop: 8 }}>
          Найдено: {filtered.length}
        </div>
      </div>

      <div className="grid">
        {filtered.map((p) => (
          <ProgramCard key={p.id} program={p} />
        ))}
      </div>
    </div>
  )
}