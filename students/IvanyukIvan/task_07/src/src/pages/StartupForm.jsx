import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createStartup, fetchStartup, updateStartup } from '../api.js';

export default function StartupForm({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === 'edit';

  const { data } = useQuery({
    queryKey: ['startup', id],
    queryFn: () => fetchStartup(id),
    enabled: isEdit
  });

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [sector, setSector] = useState('FinTech');

  useEffect(() => {
    if (data) {
      setName(data.name);
      setDesc(data.description);
      setSector(data.sector);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!name || !desc) {
        alert('Заполните все поля');
        throw new Error('invalid');
      }
      const payload = { title: name, body: desc, userId: sector === 'AI/ML' ? 2 : 1 };
      if (isEdit) {
        return updateStartup(id, payload);
      }
      return createStartup(payload);
    },
    onSuccess: (res) => {
      alert('Сохранено');
      navigate(`/startups/${res.id}`);
    },
    onError: () => alert('Что-то пошло не так')
  });

  return (
    <div>
      <h2>{isEdit ? 'Редактирование стартапа' : 'Новый стартап'}</h2>
      <form className="form" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
        <label>
          Название
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Название" />
        </label>
        <label>
          Описание
          <textarea rows="4" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Описание проекта" />
        </label>
        <label>
          Сектор
          <select value={sector} onChange={(e) => setSector(e.target.value)}>
            <option>FinTech</option>
            <option>AI/ML</option>
            <option>Retail</option>
          </select>
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Сохраняю...' : 'Сохранить'}
          </button>
          <button className="btn secondary" type="button" onClick={() => navigate(-1)}>Отмена</button>
        </div>
      </form>
    </div>
  );
}
