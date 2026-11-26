import { useState } from 'react';
import type { FormEvent } from 'react';
import api from '../services/api';
import type { ApiResponse } from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = await api.post<ApiResponse<null>>('/auth/forgot-password', { email });
      setMessage(response.data.message);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to request reset');
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <form onSubmit={submit} className="space-y-4 rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Forgot password</h1>
        {message && <p className="rounded bg-green-50 p-3 text-sm text-green-700">{message}</p>}
        {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <label className="block text-sm font-medium">Email
          <input className="mt-1 w-full rounded border px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <button className="w-full rounded bg-brand-600 px-4 py-2 font-semibold text-white">Send reset link</button>
      </form>
    </main>
  );
}
