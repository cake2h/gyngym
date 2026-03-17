import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const CATEGORY_LABELS = {
  chest: 'Грудь',
  back: 'Спина',
  legs: 'Ноги',
  shoulders: 'Плечи',
  arms: 'Руки',
  abs: 'Пресс',
};

export default function Dashboard() {
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));
  const [calendar, setCalendar] = useState({});
  const [templates, setTemplates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [sessions, setSessions] = useState([]);
  const [showLogForm, setShowLogForm] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [form, setForm] = useState({ template_id: '', sets: [] });

  useEffect(() => {
    api.get('/workout/calendar', { params: { month: currentMonth } }).then(({ data }) => setCalendar(data));
  }, [currentMonth]);

  useEffect(() => {
    api.get('/workout-templates').then(({ data }) => setTemplates(data));
  }, []);

  useEffect(() => {
    api.get('/workout/sessions', { params: { date: selectedDate } }).then(({ data }) => setSessions(data));
  }, [selectedDate]);

  useEffect(() => {
    api.get('/exercises').then(({ data }) => setExercises(data));
  }, []);

  const startOfMonth = new Date(currentMonth + '-01');
  const daysInMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;

  const prevMonth = () => {
    const d = new Date(currentMonth + '-01');
    d.setMonth(d.getMonth() - 1);
    setCurrentMonth(d.toISOString().slice(0, 7));
  };
  const nextMonth = () => {
    const d = new Date(currentMonth + '-01');
    d.setMonth(d.getMonth() + 1);
    setCurrentMonth(d.toISOString().slice(0, 7));
  };

  const handleLogWorkout = (templateId) => {
    const t = templates.find((x) => x.id === templateId);
    if (!t) return;
    setForm({
      template_id: templateId,
      sets: t.exercises.map((e, i) =>
        Array.from({ length: 3 }, (_, j) => ({
          exercise_id: e.id,
          set_number: j + 1,
          weight: '',
          reps: '',
        }))
      ).flat(),
    });
    setShowLogForm(true);
  };

  const handleSubmitLog = async (e) => {
    e.preventDefault();
    const sets = form.sets
      .filter((s) => s.weight || s.reps)
      .map((s) => ({
        exercise_id: s.exercise_id,
        set_number: s.set_number,
        weight: s.weight ? parseFloat(s.weight) : null,
        reps: s.reps ? parseInt(s.reps) : null,
      }));

    if (sets.length === 0) return;

    await api.post('/workout/sessions', {
      workout_template_id: parseInt(form.template_id),
      date: selectedDate,
      sets,
    });
    setShowLogForm(false);
    api.get('/workout/sessions', { params: { date: selectedDate } }).then(({ data }) => setSessions(data));
    api.get('/workout/calendar', { params: { month: currentMonth } }).then(({ data }) => setCalendar(data));
  };

  const handleDeleteSession = async (id) => {
    if (!confirm('Удалить тренировку?')) return;
    await api.delete(`/workout/sessions/${id}`);
    setSessions((prev) => prev.filter((s) => s.id !== id));
    api.get('/workout/calendar', { params: { month: currentMonth } }).then(({ data }) => setCalendar(data));
  };

  const getExerciseName = (id) => exercises.find((e) => e.id === id)?.name || '';

  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const [y, m] = currentMonth.split('-').map(Number);
  const monthLabel = `${monthNames[m - 1]} ${y}`;

  return (
    <div className="min-h-screen p-4 pb-24 bg-slate-50 dark:bg-slate-900">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Тренировки</h1>

      <div className="mb-6 flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 text-slate-600 dark:text-slate-400">‹</button>
        <span className="font-medium">{monthLabel}</span>
        <button onClick={nextMonth} className="p-2 text-slate-600 dark:text-slate-400">›</button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-6">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
          <div key={d} className="text-center text-xs text-slate-500 py-1">{d}</div>
        ))}
        {Array.from({ length: offset }, (_, i) => (
          <div key={`empty-${i}`} />))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateStr = `${currentMonth}-${String(day).padStart(2, '0')}`;
          const hasWorkout = calendar[dateStr]?.length > 0;
          const isSelected = selectedDate === dateStr;
          return (
            <button
              key={day}
              onClick={() => setSelectedDate(dateStr)}
              className={`aspect-square rounded-lg text-sm flex flex-col items-center justify-center ${
                isSelected
                  ? 'bg-emerald-600 text-white'
                  : hasWorkout
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {day}
              {hasWorkout && <span className="text-[10px]">●</span>}
            </button>
          );
        })}
      </div>

      <div className="mb-4">
        <h2 className="font-medium text-slate-800 dark:text-slate-100 mb-2">
          {selectedDate} {templates.length === 0 && (
            <Link to="/templates" className="text-sm text-emerald-600">Настроить шаблоны</Link>
          )}
        </h2>
        {sessions.map((s) => (
          <div key={s.id} className="p-3 bg-white dark:bg-slate-800 rounded-xl mb-2 flex justify-between items-center">
            <div>
              <span className="font-medium">{s.template?.name}</span>
              <p className="text-sm text-slate-500">
                {s.sets?.length || 0} подходов
              </p>
            </div>
            <button onClick={() => handleDeleteSession(s.id)} className="text-red-500 text-sm">Удалить</button>
          </div>
        ))}
        {sessions.length === 0 && !showLogForm && (
          <p className="text-slate-500 text-sm">
            {templates.length === 0 && 'Создайте шаблоны тренировок'}
            {templates.length > 0 && 'Нет тренировок за этот день'}
          </p>
        )}
        {templates.length > 0 && !showLogForm && (
          <button
            onClick={() => setShowLogForm(true)}
            className="mt-2 w-full py-2 border-2 border-dashed border-emerald-500 text-emerald-600 rounded-xl"
          >
            + Записать тренировку
          </button>
        )}
      </div>

      {showLogForm && (
        <form onSubmit={handleSubmitLog} className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-t-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-4">
            <h3 className="font-bold mb-4">Записать тренировку</h3>
            <select
              value={form.template_id}
              onChange={(e) => {
                const t = templates.find((x) => x.id === parseInt(e.target.value));
                if (t) {
                  setForm({
                    ...form,
                    template_id: e.target.value,
                    sets: t.exercises.flatMap((e) =>
                      [1, 2, 3].map((n) => ({
                        exercise_id: e.id,
                        set_number: n,
                        weight: '',
                        reps: '',
                      }))
                    ),
                  });
                }
              }}
              className="w-full px-4 py-2 rounded-lg border mb-4"
              required
            >
              <option value="">Выберите шаблон</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            {form.template_id && (
              <div className="space-y-2 mb-4">
                {form.sets
                  .filter((s, i, arr) => arr.findIndex((x) => x.exercise_id === s.exercise_id) === i)
                  .map((s) => (
                    <div key={s.exercise_id}>
                      <p className="text-sm font-medium mb-1">{getExerciseName(s.exercise_id)}</p>
                      <div className="flex gap-2 flex-wrap">
                        {form.sets
                          .filter((x) => x.exercise_id === s.exercise_id)
                          .sort((a, b) => a.set_number - b.set_number)
                          .map((set, idx) => (
                            <div key={idx} className="flex gap-1 items-center">
                              <span className="text-xs text-slate-500">{set.set_number}. </span>
                              <input
                                type="number"
                                step="0.5"
                                placeholder="кг"
                                className="w-14 px-2 py-1 rounded border text-sm"
                                value={form.sets.find((x) => x.exercise_id === set.exercise_id && x.set_number === set.set_number)?.weight ?? ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setForm((f) => ({
                                    ...f,
                                    sets: f.sets.map((x) =>
                                      x.exercise_id === set.exercise_id && x.set_number === set.set_number
                                        ? { ...x, weight: val }
                                        : x
                                    ),
                                  }));
                                }}
                              />
                              <input
                                type="number"
                                placeholder="повт"
                                className="w-14 px-2 py-1 rounded border text-sm"
                                value={form.sets.find((x) => x.exercise_id === set.exercise_id && x.set_number === set.set_number)?.reps ?? ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setForm((f) => ({
                                    ...f,
                                    sets: f.sets.map((x) =>
                                      x.exercise_id === set.exercise_id && x.set_number === set.set_number
                                        ? { ...x, reps: val }
                                        : x
                                    ),
                                  }));
                                }}
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowLogForm(false)} className="flex-1 py-2 border rounded-xl">
                Отмена
              </button>
              <button type="submit" className="flex-1 py-2 bg-emerald-600 text-white rounded-xl">
                Сохранить
              </button>
            </div>
          </div>
        </form>
      )}

      <Link
        to="/templates"
        className="block mt-4 py-3 text-center bg-emerald-600 text-white rounded-xl font-medium"
      >
        Шаблоны тренировок
      </Link>
    </div>
  );
}
