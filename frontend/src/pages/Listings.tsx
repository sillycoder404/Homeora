import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import type { ApiResponse } from '../services/api';
import PageMeta from '../components/PageMeta';
import { getPropertyFallbackImage } from '../utils/propertyImages';
import axios from 'axios';

export interface Property {
  _id: string;
  title: string;
  description?: string;
  price: number;
  type: string;
  listingType: 'sale';
  location: { city: string; locality: string; address: string };
  area: number;
  bedrooms: number;
  bathrooms: number;
  images: Array<{ url: string; fileId: string }>;
}

interface PropertyResult {
  properties: Property[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [result, setResult] = useState<PropertyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const response = await api.get<ApiResponse<PropertyResult>>('/properties', { params: Object.fromEntries(searchParams) });
        setResult(response.data.data);
      } catch (requestError) {
        setError(
          axios.isAxiosError<{ message?: string }>(requestError)
            ? requestError.response?.data?.message || requestError.message
            : 'Unable to load properties',
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [searchParams]);

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  }

  function goToPage(page: number) {
    setFilter('page', String(page));
    document.getElementById('property-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <main className="listings-backdrop min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:py-12">
        <PageMeta title="Properties for Sale" description="Browse and filter houses, apartments, villas, plots and commercial properties across India." path="/properties" />
        <section className="listings-hero relative isolate overflow-hidden rounded-[2rem] px-6 py-9 text-white shadow-2xl shadow-slate-950/15 sm:px-10 sm:py-12">
          <div className="relative z-10 max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Discover properties
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">Find a place<br className="hidden sm:block" /> you'll love</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
              Explore thoughtfully selected homes across India's most-loved cities and destinations.
            </p>
            <div className="mt-7 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-white/90 backdrop-blur">
                {result ? `${result.pagination.total.toLocaleString('en-IN')} homes to explore` : 'Homes across India'}
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-white/90 backdrop-blur">Buy · Compare · Discover</span>
            </div>
          </div>
        </section>
        <div className="relative z-10 -mt-5 mb-10 grid gap-3 rounded-3xl border border-white/80 bg-white/90 p-4 shadow-xl shadow-slate-900/10 backdrop-blur-md sm:grid-cols-2 md:p-5 lg:grid-cols-5">
          <select className="rounded-lg border border-slate-300 px-3 py-2.5" value={searchParams.get('location') || ''} onChange={(e) => setFilter('location', e.target.value)}>
            <option value="">All cities</option>
            {['Delhi','Mumbai','Pune','Jaipur','Gujarat','Ahmedabad','Lucknow','Kanpur','Udaipur','Manali','Shimla','Srinagar','Jammu','Gurugram','Bengaluru','Goa','Hyderabad','Mussoorie','Chennai','Kolkata','Indore','Bhopal','Nagpur','Kochi','Coimbatore','Chandigarh','Dehradun','Rishikesh','Varanasi','Agra','Amritsar','Jodhpur','Surat','Vadodara','Nashik','Noida'].map((city) => <option key={city}>{city}</option>)}
          </select>
          <select className="rounded-lg border border-slate-300 px-3 py-2.5" value={searchParams.get('type') || ''} onChange={(e) => setFilter('type', e.target.value)}>
            <option value="">All types</option>
            {['apartment', 'house', 'villa', 'plot', 'commercial'].map((type) => <option key={type}>{type}</option>)}
          </select>
          <input className="rounded-lg border border-slate-300 px-3 py-2.5" type="number" placeholder="Min price" value={searchParams.get('minPrice') || ''} onChange={(e) => setFilter('minPrice', e.target.value)} />
          <input className="rounded-lg border border-slate-300 px-3 py-2.5" type="number" placeholder="Max price" value={searchParams.get('maxPrice') || ''} onChange={(e) => setFilter('maxPrice', e.target.value)} />
          <input className="rounded-lg border border-slate-300 px-3 py-2.5" type="number" placeholder="Min area sq ft" value={searchParams.get('minArea') || ''} onChange={(e) => setFilter('minArea', e.target.value)} />
        </div>

        {loading && <p className="py-10 text-center text-slate-500">Loading properties...</p>}
        {!loading && error && <p role="alert" className="rounded-2xl border border-red-200 bg-white/90 p-5 text-center text-red-700 shadow-sm">{error}</p>}
        {!loading && result?.properties.length === 0 && <p className="rounded-2xl border border-slate-200 bg-white/80 py-12 text-center text-slate-600 shadow-sm">No properties found. Try changing your filters.</p>}
        {!loading && !error && result && result.properties.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 px-1 text-sm text-slate-600">
            <p>Showing {result.properties.length} of {result.pagination.total.toLocaleString('en-IN')} properties</p>
            <p>Page {result.pagination.page} of {result.pagination.pages}</p>
          </div>
        )}
        {!loading && !error && result && (
        <div id="property-results" className="scroll-mt-24 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {result.properties.map((property) => (
            <Link key={property._id} to={`/properties/${property._id}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
                <img
                  src={property.images[0]?.url || getPropertyFallbackImage(property.location.city, property._id)}
                  alt={property.title}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = getPropertyFallbackImage(property.location.city);
                  }}
                  className="h-52 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                />
              <div className="p-4">
                <p className="text-xl font-bold text-brand-700">₹{property.price.toLocaleString('en-IN')}</p>
                <h2 className="mt-1 font-semibold text-slate-900">{property.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{property.location.locality}, {property.location.city}</p>
                <p className="mt-3 text-sm text-slate-700">{property.area.toLocaleString('en-IN')} sq ft · {property.bedrooms} BHK · {property.bathrooms} bath</p>
              </div>
            </Link>
          ))}
        </div>
        )}
        {!loading && !error && result && result.pagination.pages > 1 && (
          <nav aria-label="Pagination" className="mt-10 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              aria-label="Go to previous page"
              disabled={result.pagination.page <= 1}
              onClick={() => goToPage(result.pagination.page - 1)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-600 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            {Array.from({ length: result.pagination.pages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                type="button"
                aria-label={`Go to page ${page}`}
                aria-current={result.pagination.page === page ? 'page' : undefined}
                onClick={() => goToPage(page)}
                className={`min-w-10 rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
                  result.pagination.page === page
                    ? 'border-brand-700 bg-brand-700 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-brand-600 hover:text-brand-700'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              aria-label="Go to next page"
              disabled={result.pagination.page >= result.pagination.pages}
              onClick={() => goToPage(result.pagination.page + 1)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-600 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </nav>
        )}
      </div>
    </main>
  );
}
