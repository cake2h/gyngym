import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const CATEGORY_LABELS = {
  chest: 'Грудь',
  back: 'Спина',
  legs: 'Ноги',
  shoulders: 'Плечи',
  arms: 'Руки',
  abs: 'Пресс',
};

export default function Templates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [form, setForm] = useState({ name: '', exercise_ids: [] });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('');

  useEffect(() => {
    api.get('/workout-templates').then(({ data }) => setTemplates(data));
  }, []);

  useEffect(() => {
    api.get('/exercises', { params: category ? { category } : {} }).then(({ data }) => setExercises(data));
  }, [category]);

  const availableExercises = exercises.filter((e) => !form.exercise_ids.includes(e.id));
  const allExercisesMap = Object.fromEntries(
    [...exercises, ...templates.flatMap((t) => t.exercises || [])].map((e) => [e.id, e])
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await api.put(`/workout-templates/${editing.id}`, form);
        setTemplates((prev) => prev.map((t) => (t.id === editing.id ? { ...t, ...form } : t)));
      } else {
        const { data } = await api.post('/workout-templates', form);
        setTemplates((prev) => [...prev, data]);
      }
      setForm({ name: '', exercise_ids: [] });
      setEditing(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (t) => {
    setEditing(t);
    setForm({
      name: t.name,
      exercise_ids: t.exercises?.map((e) => e.id) || [],
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить шаблон?')) return;
    await api.delete(`/workout-templates/${id}`);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleExercise = (id) => {
    setForm((f) => ({
      ...f,
      exercise_ids: f.exercise_ids.includes(id)
        ? f.exercise_ids.filter((x) => x !== id)
        : [...f.exercise_ids, id],
    }));
  };

  const moveExercise = (idx, dir) => {
    const arr = [...form.exercise_ids];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= arr.length) return;
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    setForm((f) => ({ ...f, exercise_ids: arr }));
  };

  return (
    <div className="min-h-screen p-4 pb-24 bg-slate-50 dark:bg-slate-900">
      <div className="flex items-center justify-between mb-6">
        <Link to="/" className="text-slate-600">← Назад</Link>
        <h1 className="text-xl font-bold">Шаблоны тренировок</h1>
        <div className="w-12" />
      </div>

      <div className="space-y-4 mb-8">
        {templates.map((t) => (
          <div key={t.id} className="p-4 bg-white dark:bg-slate-800 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <h2 className="font-medium">{t.name}</h2>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(t)} className="text-emerald-600 text-sm">Изменить</button>
                <button onClick={() => handleDelete(t.id)} className="text-red-500 text-sm">Удалить</button>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              {t.exercises?.map((e) => e.name).join(' → ') || 'Нет упражнений'}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="font-medium">{editing ? 'Редактировать' : 'Новый шаблон'}</h2>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Название (Тренировка A, Тренировка B)"
          className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
          required
        />
        <div>
          <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Упражнения (по порядку)</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {form.exercise_ids.map((id, idx) => {
              const ex = allExercisesMap[id];
              return (
                <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-sm">
                  {ex?.name || id}
                  <button type="button" onClick={() => toggleExercise(id)} className="text-red-500">×</button>
                  <button type="button" onClick={() => moveExercise(idx, -1)}>↑</button>
                  <button type="button" onClick={() => moveExercise(idx, 1)}>↓</button>
                </span>
              );
            })}
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 mb-2"
          >
            <option value="">Все категории</option>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2">
            {availableExercises.map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => toggleExercise(ex.id)}
                className="px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-600 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                + {ex.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          {editing && (
            <button type="button" onClick={() => { setEditing(null); setForm({ name: '', exercise_ids: [] }); }} className="flex-1 py-2 border rounded-xl">
              Отмена
            </button>
          )}
          <button type="submit" disabled={loading} className="flex-1 py-2 bg-emerald-600 text-white rounded-xl">
            {editing ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </form>
    </div>
  );
}
