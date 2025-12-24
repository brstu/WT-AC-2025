import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  useCreateProgramMutation,
  useGetProgramByIdQuery,
  useUpdateProgramMutation,
} from '../../app/api/programsApi'
import { Spinner } from '../../components/Spinner'
import { StateBlock } from '../../components/StateBlock'
import { useToast } from '../../app/toast/ToastProvider'

const empty = {
  title: '',
  level: 'Beginner',
  goal: 'Strength',
  durationWeeks: 4,
  sessionsPerWeek: 3,
  equipment: '',
  description: '',
}

function validate(values) {
  const errors = {}

  if (!values.title.trim()) errors.title = 'Название обязательно'
  if (!values.goal.trim()) errors.goal = 'Цель обязательна'

  const dw = Number(values.durationWeeks)
  const spw = Number(values.sessionsPerWeek)

  if (!Number.isFinite(dw) || dw < 1 || dw > 52) errors.durationWeeks = 'Длительность: 1–52 недели'
  if (!Number.isFinite(spw) || spw < 1 || spw > 14) errors.sessionsPerWeek = 'Тренировок: 1–14 в неделю'

  return errors
}

export function ProgramForm({ mode }) {
  const isEdit = mode === 'edit'
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const { data, isLoading, isError } = useGetProgramByIdQuery(id, { skip: !isEdit })
  const [createProgram, createState] = useCreateProgramMutation()
  const [updateProgram, updateState] = useUpdateProgramMutation()

  const [values, setValues] = useState(empty)
  const [touched, setTouched] = useState({})
  const errors = useMemo(() => validate(values), [values])

  useEffect(() => {
    if (isEdit && data) {
      setValues({
        title: data.title || '',
        level: data.level || 'Beginner',
        goal: data.goal || 'Strength',
        durationWeeks: data.durationWeeks ?? 4,
        sessionsPerWeek: data.sessionsPerWeek ?? 3,
        equipment: data.equipment || '',
        description: data.description || '',
      })
    }
  }, [isEdit, data])

  if (isEdit && isLoading) return <Spinner />
  if (isEdit && isError) return <StateBlock title="Ошибка" text="Не удалось загрузить данные для редактирования." />

  const onChange = (key) => (e) => {
    const val = e.target.value
    setValues((p) => ({ ...p, [key]: key.includes('Weeks') || key.includes('sessions') ? Number(val) : val }))
  }

  const onBlur = (key) => () => setTouched((p) => ({ ...p, [key]: true }))

  const canSubmit = Object.keys(errors).length === 0

  const onSubmit = async (e) => {
    e.preventDefault()
    setTouched({
      title: true,
      goal: true,
      durationWeeks: true,
      sessionsPerWeek: true,
    })

    if (!canSubmit) {
      toast.push('Проверь поля формы', 'error')
      return
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
    const payload = {
      ...values,
      updatedAt: now,
    }

    try {
      if (isEdit) {
        await updateProgram({ id, ...payload, createdAt: data?.createdAt || now }).unwrap()
        toast.push('Программа обновлена', 'success')
        navigate(`/programs/${id}`)
      } else {
        await createProgram({ ...payload, createdAt: now }).unwrap()
        toast.push('Программа создана', 'success')
        navigate('/programs')
      }
    } catch {
      toast.push('Ошибка сохранения', 'error')
    }
  }

  const loading = createState.isLoading || updateState.isLoading

  return (
    <div className="stack">
      <div className="row row--between">
        <h1 style={{ margin: 0 }}>{isEdit ? 'Редактирование' : 'Новая программа'}</h1>
        <Link className="btn btn--ghost" to={isEdit ? `/programs/${id}` : '/programs'}>
          ← Назад
        </Link>
      </div>

      <form className="card stack" onSubmit={onSubmit}>
        <label className="field">
          <div className="label">Название *</div>
          <input className="input" value={values.title} onChange={onChange('title')} onBlur={onBlur('title')} />
          {touched.title && errors.title ? <div className="error">{errors.title}</div> : null}
        </label>

        <div className="row">
          <label className="field">
            <div className="label">Уровень</div>
            <select className="input" value={values.level} onChange={onChange('level')}>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </label>

          <label className="field">
            <div className="label">Цель *</div>
            <select className="input" value={values.goal} onChange={onChange('goal')} onBlur={onBlur('goal')}>
              <option value="Strength">Strength</option>
              <option value="Hypertrophy">Hypertrophy</option>
              <option value="Fat loss">Fat loss</option>
              <option value="Endurance">Endurance</option>
              <option value="Mobility">Mobility</option>
            </select>
            {touched.goal && errors.goal ? <div className="error">{errors.goal}</div> : null}
          </label>
        </div>

        <div className="row">
          <label className="field">
            <div className="label">Длительность (недель) *</div>
            <input
              className="input"
              type="number"
              min="1"
              max="52"
              value={values.durationWeeks}
              onChange={onChange('durationWeeks')}
              onBlur={onBlur('durationWeeks')}
            />
            {touched.durationWeeks && errors.durationWeeks ? <div className="error">{errors.durationWeeks}</div> : null}
          </label>

          <label className="field">
            <div className="label">Тренировок в неделю *</div>
            <input
              className="input"
              type="number"
              min="1"
              max="14"
              value={values.sessionsPerWeek}
              onChange={onChange('sessionsPerWeek')}
              onBlur={onBlur('sessionsPerWeek')}
            />
            {touched.sessionsPerWeek && errors.sessionsPerWeek ? (
              <div className="error">{errors.sessionsPerWeek}</div>
            ) : null}
          </label>
        </div>

        <label className="field">
          <div className="label">Оборудование</div>
          <input className="input" value={values.equipment} onChange={onChange('equipment')} />
        </label>

        <label className="field">
          <div className="label">Описание</div>
          <textarea className="input" rows={5} value={values.description} onChange={onChange('description')} />
        </label>

        <div className="row">
          <button className="btn" type="submit" disabled={!canSubmit || loading}>
            {loading ? 'Сохранение…' : 'Сохранить'}
          </button>
          <button
            className="btn btn--ghost"
            type="button"
            onClick={() => setValues(empty)}
            disabled={loading}
          >
            Сбросить
          </button>
        </div>
      </form>
    </div>
  )
}