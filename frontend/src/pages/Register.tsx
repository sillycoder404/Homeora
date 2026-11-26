import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { ApiResponse } from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await api.post<ApiResponse<unknown>>('/auth/register', form);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <form onSubmit={submit} className="space-y-4 rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Create account</h1>
        {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {(['name', 'email', 'phone', 'password'] as const).map((field) => (
          <label className="block text-sm font-medium" key={field}>
            {field[0].toUpperCase() + field.slice(1)}
            <input
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              required={field !== 'phone'}
            />
          </label>
        ))}
        <button disabled={loading} className="w-full rounded bg-brand-600 px-4 py-2 font-semibold text-white">
          {loading ? 'Creating...' : 'Register'}
        </button>
        <Link to="/login" className="block text-center text-sm text-brand-700">Already have an account? Login</Link>
      </form>
    </main>
  );
}
