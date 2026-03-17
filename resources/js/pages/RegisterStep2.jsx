import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterStep2() {
  const [form, setForm] = useState({ name: '', birth_date: '', weight: '', gender: 'male', password: '', password_confirmation: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/register/complete', form);
      updateUser(data.user);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || Object.values(err.response?.data?.errors || {}).flat()[0] || 'Ошибка';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 pb-24">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Завершение регистрации</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">Шаг 2: укажите данные</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="ФИО"
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
            required
          />
          <input
            type="date"
            value={form.birth_date}
            onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
            required
          />
          <input
            type="number"
            step="0.1"
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: e.target.value })}
            placeholder="Вес (кг)"
            min="20"
            max="300"
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
            required
          />
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="male">Мужской</option>
            <option value="female">Женский</option>
          </select>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Пароль"
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
            required
            minLength={8}
          />
          <input
            type="password"
            value={form.password_confirmation}
            onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
            placeholder="Подтверждение пароля"
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
          >
            {loading ? 'Загрузка...' : 'Готово'}
          </button>
        </form>
      </div>
    </div>
  );
}
