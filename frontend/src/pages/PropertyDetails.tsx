import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import type { ApiResponse } from '../services/api';
import type { Property } from './Listings';
import { useAuth } from '../context/useAuth';
import PageMeta from '../components/PageMeta';
import { getPropertyFallbackImage, getPropertyGalleryImages } from '../utils/propertyImages';

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

  const galleryImages = getPropertyGalleryImages(property.location.city, property._id, property.images);

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
    <main className="min-h-screen bg-[#f6f5ef]">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
      <PageMeta
        title={property.title}
        description={`${property.bedrooms} BHK property in ${property.location.locality}, ${property.location.city} for ₹${property.price.toLocaleString('en-IN')}`}
        path={`/properties/${property._id}`}
        image={galleryImages[0]?.url}
      />
      <div role="group" aria-label={`${galleryImages.length} property photos`} className="grid grid-cols-2 gap-3 overflow-hidden rounded-[1.75rem] md:grid-cols-[1.7fr_1fr_1fr] md:grid-rows-[220px_220px]">
        {galleryImages.map((image, index) => (
          <figure
            key={image.fileId}
            className={`group relative min-h-40 overflow-hidden rounded-2xl bg-stone-200 sm:min-h-56 md:min-h-0 ${
              index === 0
                ? 'col-span-2 min-h-[18rem] md:col-span-1 md:row-span-2'
                : index === 3
                  ? 'col-span-2 md:col-span-2'
                  : 'col-span-1'
            }`}
          >
            <img
              src={image.url}
              alt={`${property.title} - photo ${index + 1}`}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = getPropertyFallbackImage(property.location.city, `${property._id}-${index + 1}`);
              }}
              className={`h-40 w-full object-cover transition duration-500 group-hover:scale-[1.03] sm:h-56 md:h-full ${
                index === 0 ? 'min-h-[18rem] md:min-h-0' : ''
              }`}
            />
            {image.isRepresentative && (
              <figcaption className="absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                Representative photo
              </figcaption>
            )}
          </figure>
        ))}
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <section className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-3xl font-bold tracking-tight text-brand-700">₹{property.price.toLocaleString('en-IN')}</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{property.title}</h1>
          <p className="mt-3 text-slate-600">{property.location.address}, {property.location.locality}, {property.location.city}</p>
          <div className="mt-6 grid grid-cols-3 gap-3 border-y border-stone-200 py-5 text-center">
            <div>
              <p className="text-lg font-semibold text-slate-900">{property.area.toLocaleString('en-IN')}</p>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">sq ft</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">{property.bedrooms} BHK</p>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">Bedrooms</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">{property.bathrooms}</p>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">Bathrooms</p>
            </div>
          </div>
          {property.description && <p className="mt-5 leading-7 text-slate-600">{property.description}</p>}
        </section>
        <aside className="h-fit rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm">
          <p className="text-lg font-semibold text-slate-900">Interested in this home?</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Schedule a private viewing and get more details about the property.</p>
          <button onClick={() => setBookingOpen(true)} className="mt-5 w-full rounded-xl bg-brand-700 px-5 py-3 font-semibold text-white transition hover:bg-brand-600">
            Book a viewing
          </button>
        </aside>
      </div>

      {bookingOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog">
          <form onSubmit={submitBooking} className="w-full max-w-lg space-y-3 rounded-3xl bg-white p-6 shadow-2xl">
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
      </div>
    </main>
  );
}
