import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { ApiResponse } from '../services/api';
import type { Property } from './Listings';
import PageMeta from '../components/PageMeta';

interface Appointment {
  _id: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  property?: Property;
}

export default function Dashboard() {
  const [tab, setTab] = useState<'listings' | 'appointments'>('listings');
  const [properties, setProperties] = useState<Property[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    api.get<ApiResponse<Property[]>>('/properties/my').then((response) => setProperties(response.data.data));
    api.get<ApiResponse<Appointment[]>>('/appointments/my').then((response) => setAppointments(response.data.data));
  }, []);

  async function deleteProperty(id: string) {
    if (!window.confirm('Delete this property?')) return;
    await api.delete(`/properties/${id}`);
    setProperties((current) => current.filter((property) => property._id !== id));
  }

  async function cancelAppointment(id: string) {
    await api.patch<ApiResponse<Appointment>>(`/appointments/${id}/cancel`);
    setAppointments((current) => current.map((appointment) =>
      appointment._id === id ? { ...appointment, status: 'cancelled' } : appointment,
    ));
  }

  return (
    <main className="mx-auto max-w-5xl p-4 md:p-6">
      <PageMeta title="Dashboard" description="Manage your property listings and viewing appointments." path="/dashboard" />
      <h1 className="mb-5 text-3xl font-bold">Dashboard</h1>
      <div className="mb-5 flex gap-2">
        <button onClick={() => setTab('listings')} className={`rounded px-4 py-2 ${tab === 'listings' ? 'bg-brand-600 text-white' : 'bg-white'}`}>My Listings</button>
        <button onClick={() => setTab('appointments')} className={`rounded px-4 py-2 ${tab === 'appointments' ? 'bg-brand-600 text-white' : 'bg-white'}`}>My Appointments</button>
      </div>

      {tab === 'listings' && (
        <div className="space-y-3">
          {properties.map((property) => (
            <article key={property._id} className="flex flex-col justify-between gap-3 rounded-xl bg-white p-4 shadow sm:flex-row">
              <div>
                <h2 className="font-bold">{property.title}</h2>
                <p className="text-sm text-slate-600">{property.location.locality}, {property.location.city}</p>
              </div>
              <div className="flex gap-2">
                <Link to={`/properties/${property._id}/edit`} className="rounded bg-slate-100 px-3 py-2 text-sm">Edit</Link>
                <button onClick={() => deleteProperty(property._id)} className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">Delete</button>
              </div>
            </article>
          ))}
          {properties.length === 0 && <p className="rounded bg-white p-6 text-slate-500">You have no listings yet.</p>}
        </div>
      )}

      {tab === 'appointments' && (
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <article key={appointment._id} className="flex flex-col justify-between gap-3 rounded-xl bg-white p-4 shadow sm:flex-row">
              <div>
                <h2 className="font-bold">{appointment.property?.title || 'Property viewing'}</h2>
                <p className="text-sm text-slate-600">{new Date(appointment.date).toLocaleDateString('en-IN')} at {appointment.time}</p>
                <span className={`mt-2 inline-block rounded-full px-2 py-1 text-xs ${
                  appointment.status === 'confirmed' ? 'bg-green-100 text-green-700'
                    : appointment.status === 'cancelled' ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                }`}>{appointment.status}</span>
              </div>
              {appointment.status !== 'cancelled' && (
                <button onClick={() => cancelAppointment(appointment._id)} className="self-start rounded bg-red-50 px-3 py-2 text-sm text-red-700">Cancel</button>
              )}
            </article>
          ))}
          {appointments.length === 0 && <p className="rounded bg-white p-6 text-slate-500">You have no appointments yet.</p>}
        </div>
      )}
    </main>
  );
}
