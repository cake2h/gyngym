import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

export default function Measurements() {
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState([]);
  const [chartType, setChartType] = useState('');
  const [chartData, setChartData] = useState([]);
  const [form, setForm] = useState({ type: '', value: '', measured_at: new Date().toISOString().slice(0, 10) });
  const [loading, setLoading] = useState(false);

  const types = user?.gender === 'female'
    ? ['shoulders', 'chest', 'hips', 'waist']
    : ['shoulders', 'chest', 'wrists', 'forearms', 'abs'];

  useEffect(() => {
    api.get('/measurements').then(({ data }) => setMeasurements(data));
  }, []);

  useEffect(() => {
    if (chartType) {
      api.get(`/measurements/chart/${chartType}`).then(({ data }) => setChartData(data));
    } else {
      setChartData([]);
    }
  }, [chartType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/measurements', form);
      setMeasurements((prev) => [data, ...prev]);
      setForm({ type: '', value: '', measured_at: new Date().toISOString().slice(0, 10) });
      if (chartType === form.type) {
        setChartData((prev) => [...prev, { date: form.measured_at, value: parseFloat(form.value) }].sort((a, b) => a.date.localeCompare(b.date)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить замер?')) return;
    await api.delete(`/measurements/${id}`);
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="min-h-screen p-4 pb-24 bg-slate-50 dark:bg-slate-900">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Замеры</h1>

      <form onSubmit={handleSubmit} className="mb-8 p-4 bg-white dark:bg-slate-800 rounded-xl space-y-3">
        <h2 className="font-medium text-slate-800 dark:text-slate-100">Добавить замер</h2>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
          required
        >
          <option value="">Выберите параметр</option>
          {types.map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t] || t}</option>
          ))}
        </select>
        <input
          type="number"
          step="0.1"
          value={form.value}
          onChange={(e) => setForm({ ...form, value: e.target.value })}
          placeholder="Значение (см)"
          className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
          required
        />
        <input
          type="date"
          value={form.measured_at}
          onChange={(e) => setForm({ ...form, measured_at: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
          required
        />
        <button type="submit" disabled={loading} className="w-full py-2 bg-emerald-600 text-white rounded-lg">
          Добавить
        </button>
      </form>

      <div className="mb-8">
        <h2 className="font-medium text-slate-800 dark:text-slate-100 mb-2">График</h2>
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 mb-4"
        >
          <option value="">Выберите параметр</option>
          {types.map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t] || t}</option>
          ))}
        </select>
        {chartData.length > 0 && (
          <div className="h-64 bg-white dark:bg-slate-800 rounded-xl p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8 }} />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div>
        <h2 className="font-medium text-slate-800 dark:text-slate-100 mb-2">История</h2>
        <div className="space-y-2">
          {measurements.map((m) => (
            <div
              key={m.id}
              className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-xl"
            >
              <div>
                <span className="font-medium">{TYPE_LABELS[m.type] || m.type}</span>
                <span className="text-slate-500 ml-2">{m.value} см</span>
                <span className="text-slate-400 text-sm ml-2">{m.measured_at}</span>
              </div>
              <button
                onClick={() => handleDelete(m.id)}
                className="text-red-500 hover:text-red-600 text-sm"
              >
                Удалить
              </button>
            </div>
          ))}
          {measurements.length === 0 && (
            <p className="text-slate-500 text-center py-8">Пока нет замеров</p>
          )}
        </div>
      </div>
    </div>
  );
}
