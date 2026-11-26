import { useEffect, useState } from 'react';
import api from '../services/api';
import type { ApiResponse } from '../services/api';
import PageMeta from '../components/PageMeta';

interface Overview {
  users: Array<{ _id: string; name: string; email: string; role: string }>;
  properties: Array<{ _id: string; title: string; price: number; location: { city: string; locality: string }; owner?: { name: string } }>;
  appointments: Array<{ _id: string; status: string; date: string; time: string; property?: { title: string }; user?: { name: string } }>;
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

  useEffect(() => {
    api.get<ApiResponse<Overview>>('/admin/overview')
      .then((response) => setOverview(response.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load admin data'));
  }, []);

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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Users', overview.stats.users],
              ['Properties', overview.stats.properties],
              ['Appointments', overview.stats.appointments],
              ['Pending', overview.stats.pendingAppointments],
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
            <div className="divide-y">
              {overview.appointments.map((appointment) => (
                <div key={appointment._id} className="flex items-center justify-between px-5 py-3">
                  <div><p className="font-semibold">{appointment.property?.title || 'Property viewing'}</p><p className="text-sm text-slate-500">{appointment.user?.name || 'Guest'} · {new Date(appointment.date).toLocaleDateString('en-IN')} · {appointment.time}</p></div>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold">{appointment.status}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
