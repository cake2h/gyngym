import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

const TYPE_LABELS = {
  shoulders: 'Плечи',
  chest: 'Грудь',
  wrists: 'Запястья',
  forearms: 'Предплечья',
  abs: 'Пресс',
  hips: 'Ягодицы',
  waist: 'Талия',
};

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', birth_date: '', weight: '', gender: 'male' });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        birth_date: user.birth_date ? user.birth_date.split('T')[0] : '',
        weight: user.weight?.toString() || '',
        gender: user.gender || 'male',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      const { data } = await api.put('/profile', {
        ...form,
        birth_date: form.birth_date || null,
        weight: form.weight ? parseFloat(form.weight) : null,
      });
      updateUser(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const types = user?.gender === 'female'
    ? ['shoulders', 'chest', 'hips', 'waist']
    : ['shoulders', 'chest', 'wrists', 'forearms', 'abs'];

  return (
    <div className="min-h-screen p-4 pb-24 bg-slate-50 dark:bg-slate-900">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Профиль</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        <div>
          <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">ФИО</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Дата рождения</label>
          <input
            type="date"
            value={form.birth_date}
            onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Вес (кг)</label>
          <input
            type="number"
            step="0.1"
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Пол</label>
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
          >
            <option value="male">Мужской</option>
            <option value="female">Женский</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium rounded-xl"
        >
          {loading ? 'Сохранение...' : saved ? 'Сохранено!' : 'Сохранить'}
        </button>
      </form>
      <div className="mt-8 p-4 bg-white dark:bg-slate-800 rounded-xl">
        <h2 className="font-medium text-slate-800 dark:text-slate-100 mb-2">Ваши замеры</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {types.map((t) => TYPE_LABELS[t] || t).join(', ')}
        </p>
      </div>
      <button
        onClick={async () => { await logout(); navigate('/login'); }}
        className="mt-8 w-full py-3 border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-xl"
      >
        Выйти
      </button>
    </div>
  );
}
