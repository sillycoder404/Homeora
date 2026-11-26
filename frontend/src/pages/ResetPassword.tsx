import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import type { ApiResponse } from '../services/api';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    try {
      await api.post<ApiResponse<null>>(`/auth/reset-password/${token}`, { password });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to reset password');
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <form onSubmit={submit} className="space-y-4 rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Reset password</h1>
        {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <label className="block text-sm font-medium">New password
          <input className="mt-1 w-full rounded border px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button className="w-full rounded bg-brand-600 px-4 py-2 font-semibold text-white">Reset password</button>
      </form>
    </main>
  );
}
