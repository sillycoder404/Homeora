import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import type { ApiResponse } from '../services/api';
import type { Property } from './Listings';
import { useAuth } from '../context/useAuth';
import PageMeta from '../components/PageMeta';
import { getPropertyFallbackImage } from '../utils/propertyImages';

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [error, setError] = useState('');
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [minimumBookingDate] = useState(() => new Date().toISOString().slice(0, 10));
  const { user } = useAuth();
  const [booking, setBooking] = useState({
    guestName: '', guestEmail: '', guestPhone: '', date: '', time: '10:00 AM', message: '',
  });

  useEffect(() => {
    api.get<ApiResponse<Property>>(`/properties/${id}`)
      .then((response) => setProperty(response.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Property not found'));
  }, [id]);

  if (error) return <main className="p-8 text-center text-red-700">{error}</main>;
  if (!property) return <main className="p-8 text-center">Loading property...</main>;

  async function submitBooking(event: FormEvent) {
    event.preventDefault();
    setBookingError('');
    setBookingMessage('');
    try {
      const endpoint = user ? '/appointments' : '/appointments/guest';
      await api.post(endpoint, {
        property: id,
        ...(!user ? {
          guestName: booking.guestName,
          guestEmail: booking.guestEmail,
          guestPhone: booking.guestPhone,
        } : {}),
        date: booking.date,
        time: booking.time,
        message: booking.message,
      });
      setBookingMessage('Viewing booked successfully');
    } catch (err: any) {
      setBookingError(err.response?.data?.message || 'Unable to book viewing');
    }
  }

  return (
    <main className="mx-auto max-w-5xl p-4 md:p-6">
      <PageMeta
        title={property.title}
        description={`${property.bedrooms} BHK property in ${property.location.locality}, ${property.location.city} for ₹${property.price.toLocaleString('en-IN')}`}
        path={`/properties/${property._id}`}
        image={property.images[0]?.url}
      />
      <div className="grid gap-3 md:grid-cols-2">
        {(property.images.length ? property.images : [{ url: getPropertyFallbackImage(property.location.city, property._id), fileId: 'fallback' }]).map((image) => (
          <img
            key={image.fileId}
            src={image.url}
            alt={property.title}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = getPropertyFallbackImage(property.location.city);
            }}
            className="h-72 w-full rounded-xl object-cover"
          />
        ))}
      </div>
      <div className="mt-6 rounded-xl bg-white p-6 shadow">
        <p className="text-3xl font-bold text-brand-700">₹{property.price.toLocaleString('en-IN')}</p>
        <h1 className="mt-2 text-2xl font-bold">{property.title}</h1>
        <p className="mt-2 text-slate-600">{property.location.address}, {property.location.locality}, {property.location.city}</p>
        <p className="mt-4 text-slate-700">{property.area.toLocaleString('en-IN')} sq ft · {property.bedrooms} BHK · {property.bathrooms} bathrooms</p>
        <button onClick={() => setBookingOpen(true)} className="mt-5 rounded bg-brand-600 px-5 py-2 font-semibold text-white">Book a viewing</button>
      </div>

      {bookingOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/50 p-4" role="dialog">
          <form onSubmit={submitBooking} className="w-full max-w-lg space-y-3 rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Book a viewing</h2>
              <button type="button" onClick={() => setBookingOpen(false)} aria-label="Close" className="text-2xl">×</button>
            </div>
            {bookingError && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{bookingError}</p>}
            {bookingMessage && <p className="rounded bg-green-50 p-3 text-sm text-green-700">{bookingMessage}</p>}
            {!user && (
              <>
                <input className="w-full rounded border px-3 py-2" placeholder="Guest name" value={booking.guestName} onChange={(e) => setBooking({ ...booking, guestName: e.target.value })} required />
                <input className="w-full rounded border px-3 py-2" type="email" placeholder="Email" value={booking.guestEmail} onChange={(e) => setBooking({ ...booking, guestEmail: e.target.value })} required />
                <input className="w-full rounded border px-3 py-2" placeholder="Phone" value={booking.guestPhone} onChange={(e) => setBooking({ ...booking, guestPhone: e.target.value })} required />
              </>
            )}
            <input className="w-full rounded border px-3 py-2" type="date" min={minimumBookingDate} value={booking.date} onChange={(e) => setBooking({ ...booking, date: e.target.value })} required />
            <select className="w-full rounded border px-3 py-2" value={booking.time} onChange={(e) => setBooking({ ...booking, time: e.target.value })}>
              {['10:00 AM', '11:30 AM', '2:00 PM', '4:30 PM', '6:00 PM'].map((time) => <option key={time}>{time}</option>)}
            </select>
            <textarea className="w-full rounded border px-3 py-2" placeholder="Message" value={booking.message} onChange={(e) => setBooking({ ...booking, message: e.target.value })} />
            <button className="w-full rounded bg-brand-600 px-4 py-2 font-semibold text-white">Confirm booking</button>
          </form>
        </div>
      )}
    </main>
  );
}
