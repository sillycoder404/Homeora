import { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../services/api';
import type { ApiResponse } from '../services/api';
import PageMeta from '../components/PageMeta';

interface AdminAppointment {
  _id: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  date: string;
  time: string;
  message?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  property?: { title: string; location?: { city: string; locality: string } };
  user?: { name: string; email: string };
}

interface Overview {
  users: Array<{ _id: string; name: string; email: string; role: string }>;
  properties: Array<{ _id: string; title: string; price: number; location: { city: string; locality: string }; owner?: { name: string } }>;
  appointments: AdminAppointment[];
  stats: {
    users: number;
    properties: number;
    appointments: number;
    pendingAppointments: number;
    confirmedAppointments: number;
    cancelledAppointments: number;
  };
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [confirmingAppointmentId, setConfirmingAppointmentId] = useState('');

  useEffect(() => {
    api.get<ApiResponse<Overview>>('/admin/overview')
      .then((response) => setOverview(response.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load admin data'));
  }, []);

  async function confirmAppointment(id: string) {
    setActionError('');
    setConfirmingAppointmentId(id);
    try {
      const response = await api.patch<ApiResponse<AdminAppointment>>(`/admin/appointments/${id}/confirm`);
      setOverview((current) => {
        if (!current) return current;
        const wasPending = current.appointments.some((appointment) => appointment._id === id && appointment.status === 'pending');
        return {
          ...current,
          appointments: current.appointments.map((appointment) =>
            appointment._id === id ? { ...appointment, status: response.data.data.status } : appointment,
          ),
          stats: {
            ...current.stats,
            pendingAppointments: wasPending ? Math.max(0, current.stats.pendingAppointments - 1) : current.stats.pendingAppointments,
            confirmedAppointments: wasPending ? current.stats.confirmedAppointments + 1 : current.stats.confirmedAppointments,
          },
        };
      });
    } catch (requestError) {
      setActionError(
        axios.isAxiosError<{ message?: string }>(requestError)
          ? requestError.response?.data?.message || requestError.message
          : 'Unable to confirm appointment',
      );
    } finally {
      setConfirmingAppointmentId('');
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <PageMeta title="Admin Control Center" description="Manage users, properties and appointments on Homeora." path="/admin" />
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-700">HOMEORA CONTROL</p>
          <h1 className="mt-1 text-3xl font-bold">Admin dashboard</h1>
        </div>
      </div>
      {error && <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}
      {overview && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ['Users', overview.stats.users],
              ['Properties', overview.stats.properties],
              ['Appointments', overview.stats.appointments],
              ['Pending', overview.stats.pendingAppointments],
              ['Confirmed', overview.stats.confirmedAppointments],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
              </div>
            ))}
          </div>

          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <h2 className="border-b px-5 py-4 text-lg">Users</h2>
              <div className="max-h-96 divide-y overflow-y-auto">
                {overview.users.map((user) => (
                  <div key={user._id} className="flex items-center justify-between px-5 py-3">
                    <div><p className="font-semibold">{user.name}</p><p className="text-sm text-slate-500">{user.email}</p></div>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${user.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-700'}`}>{user.role}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <h2 className="border-b px-5 py-4 text-lg">Properties</h2>
              <div className="max-h-96 divide-y overflow-y-auto">
                {overview.properties.map((property) => (
                  <div key={property._id} className="px-5 py-3">
                    <p className="font-semibold">{property.title}</p>
                    <p className="text-sm text-slate-500">{property.location.locality}, {property.location.city} · ₹{property.price.toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <h2 className="border-b px-5 py-4 text-lg">Appointments</h2>
            {actionError && <p role="alert" className="m-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{actionError}</p>}
            <div className="divide-y">
              {overview.appointments.map((appointment) => {
                const contactName = appointment.user?.name || appointment.guestName || 'Guest';
                const contactEmail = appointment.user?.email || appointment.guestEmail;
                const statusClass = appointment.status === 'confirmed'
                  ? 'bg-green-100 text-green-700'
                  : appointment.status === 'cancelled'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-800';

                return (
                  <article key={appointment._id} className="flex flex-col justify-between gap-4 px-5 py-4 sm:flex-row sm:items-center">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{appointment.property?.title || 'Property viewing'}</p>
                      <p className="mt-1 text-sm text-slate-700">
                        {contactName}{contactEmail ? ` · ${contactEmail}` : ''}{appointment.guestPhone ? ` · ${appointment.guestPhone}` : ''}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {new Date(appointment.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {appointment.time}
                      </p>
                      {appointment.property?.location && (
                        <p className="mt-1 text-sm text-slate-500">
                          {appointment.property.location.locality}, {appointment.property.location.city}
                        </p>
                      )}
                      {appointment.message && <p className="mt-2 text-sm text-slate-600">Note: {appointment.message}</p>}
                      <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusClass}`}>
                        {appointment.status}
                      </span>
                    </div>
                    {appointment.status === 'pending' && (
                      <button
                        type="button"
                        disabled={confirmingAppointmentId === appointment._id}
                        onClick={() => confirmAppointment(appointment._id)}
                        className="self-start rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-wait disabled:opacity-60 sm:self-center"
                      >
                        {confirmingAppointmentId === appointment._id ? 'Confirming…' : 'Confirm appointment'}
                      </button>
                    )}
                  </article>
                );
              })}
              {overview.appointments.length === 0 && <p className="p-6 text-sm text-slate-500">No appointments have been requested yet.</p>}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
