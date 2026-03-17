import { useState, useEffect } from 'react';
import api from '../api';

const TYPE_LABELS = { text: 'Заметка', link: 'Ссылка', video: 'Видео' };

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', type: 'text', url: '' });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    api.get('/notes').then(({ data }) => setNotes(data));
  }, []);

  const resetForm = () => {
    setForm({ title: '', content: '', type: 'text', url: '' });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        content: form.content.trim() || null,
        type: form.type,
        url: form.url?.trim() || null,
      };
      if (editing) {
        const { data } = await api.put(`/notes/${editing.id}`, payload);
        setNotes((prev) => prev.map((n) => (n.id === editing.id ? data : n)));
      } else {
        const { data } = await api.post('/notes', payload);
        setNotes((prev) => [data, ...prev]);
      }
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (n) => {
    setEditing(n);
    setForm({
      title: n.title,
      content: n.content || '',
      type: n.type || 'text',
      url: n.url || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить заметку?')) return;
    await api.delete(`/notes/${id}`);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (editing?.id === id) resetForm();
  };

  const isLinkOrVideo = form.type === 'link' || form.type === 'video';

  return (
    <div className="min-h-screen p-4 pb-24 bg-slate-50 dark:bg-slate-900">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">База знаний</h1>

      <div className="space-y-3 mb-8">
        {notes.map((n) => (
          <div key={n.id} className="p-4 bg-white dark:bg-slate-800 rounded-xl">
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0 flex-1">
                <h2 className="font-medium text-slate-800 dark:text-slate-100 truncate">{n.title}</h2>
                <span className="text-xs text-slate-500">{TYPE_LABELS[n.type] || n.type}</span>
                {n.content && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{n.content}</p>
                )}
                {n.url && (
                  <a
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-emerald-600 hover:underline block mt-1 truncate"
                  >
                    {n.url}
                  </a>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => handleEdit(n)} className="text-emerald-600 text-sm">Изменить</button>
                <button onClick={() => handleDelete(n.id)} className="text-red-500 text-sm">Удалить</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {notes.length === 0 && !showForm && (
        <p className="text-slate-500 text-center py-8">Нет заметок. Добавьте первую.</p>
      )}

      {!showForm && (
        <button
          onClick={() => { setShowForm(true); setEditing(null); setForm({ title: '', content: '', type: 'text', url: '' }); }}
          className="w-full py-3 border-2 border-dashed border-emerald-500 text-emerald-600 rounded-xl font-medium"
        >
          + Добавить заметку
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white dark:bg-slate-800 rounded-xl">
          <h2 className="font-medium">{editing ? 'Редактировать' : 'Новая заметка'}</h2>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Заголовок"
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
            required
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
          >
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          {isLinkOrVideo && (
            <input
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder={form.type === 'video' ? 'Ссылка на видео' : 'URL'}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
            />
          )}
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Описание или текст заметки"
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 resize-none"
          />
          <div className="flex gap-2">
            <button type="button" onClick={resetForm} className="flex-1 py-2 border border-slate-300 dark:border-slate-600 rounded-xl">
              Отмена
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2 bg-emerald-600 text-white rounded-xl">
              {editing ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
